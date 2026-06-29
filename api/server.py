from __future__ import annotations

import json
import math
import random
import sqlite3
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse


ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "aquacore.db"
HOST = "127.0.0.1"
PORT = 8000


def dict_rows(cursor: sqlite3.Cursor, rows: list[sqlite3.Row]) -> list[dict]:
    return [dict(row) for row in rows]


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def create_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS servers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            cluster_name TEXT NOT NULL,
            location TEXT NOT NULL,
            cooling_type TEXT NOT NULL,
            base_water_lph REAL NOT NULL,
            status TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            server_id INTEGER NOT NULL,
            timestamp TEXT NOT NULL,
            temperature_c REAL NOT NULL,
            cpu_percent REAL NOT NULL,
            cooling_efficiency REAL NOT NULL,
            water_liters REAL NOT NULL,
            FOREIGN KEY (server_id) REFERENCES servers(id)
        );

        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            server_id INTEGER NOT NULL,
            timestamp TEXT NOT NULL,
            predicted_water_liters REAL NOT NULL,
            confidence REAL NOT NULL,
            risk_level TEXT NOT NULL,
            FOREIGN KEY (server_id) REFERENCES servers(id)
        );

        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            server_id INTEGER,
            timestamp TEXT NOT NULL,
            severity TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            resolved INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (server_id) REFERENCES servers(id)
        );

        CREATE TABLE IF NOT EXISTS daily_targets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL UNIQUE,
            target_liters REAL NOT NULL
        );
        """
    )
    conn.commit()


def predict_water_liters(
    base_water_lph: float,
    temperature_c: float,
    cpu_percent: float,
    cooling_efficiency: float,
) -> float:
    thermal_factor = max(0, temperature_c - 24) * 720
    cpu_factor = cpu_percent * 260
    heat_penalty = 18000 if temperature_c >= 42 else 0
    efficiency_bonus = (cooling_efficiency - 0.70) * 28000
    raw_estimate = base_water_lph + thermal_factor + cpu_factor + heat_penalty - efficiency_bonus
    return max(0, raw_estimate * 0.68)


def risk_level(temperature_c: float, cpu_percent: float, water_liters: float) -> str:
    if temperature_c >= 45 or water_liters >= 85000:
        return "critical"
    if temperature_c >= 40 or cpu_percent >= 82 or water_liters >= 70000:
        return "warning"
    return "normal"


def format_compact_liters(liters: float) -> str:
    if liters >= 1_000_000:
        return f"{liters / 1_000_000:.1f}M"
    if liters >= 1_000:
        return f"{liters / 1_000:.0f}k"
    return f"{liters:.0f}"


def format_delta_percent(value: float) -> str:
    sign = "+" if value >= 0 else ""
    return f"{sign}{value:.0f}%"


def time_ago_label(timestamp: str) -> str:
    try:
        then = datetime.fromisoformat(timestamp)
    except ValueError:
        return "agora"

    diff = datetime.now() - then
    minutes = max(0, int(diff.total_seconds() // 60))
    if minutes < 2:
        return "agora"
    if minutes < 60:
        return f"{minutes} min"
    hours = minutes // 60
    return f"{hours} h"


def format_liters_k(liters: float) -> str:
    return f"{liters / 1000:.0f}k L"


def seed_database(conn: sqlite3.Connection) -> None:
    has_servers = conn.execute("SELECT COUNT(*) AS total FROM servers").fetchone()["total"]
    if has_servers:
        return

    random.seed(42)
    servers = [
        ("A3", "Servidor A3", "Nucleo IA", "Data Center Sao Paulo", "liquid cooling", 33000, "critical"),
        ("B2", "Servidor B2", "Nucleo IA", "Data Center Sao Paulo", "hybrid cooling", 28500, "warning"),
        ("C1", "Servidor C1", "Treinamento ML", "Data Center Sao Paulo", "air assisted", 24500, "normal"),
        ("D4", "Servidor D4", "Inferencia", "Data Center Sao Paulo", "hybrid cooling", 21500, "normal"),
        ("E2", "Servidor E2", "Backup Analytics", "Data Center Sao Paulo", "air assisted", 18000, "normal"),
    ]
    conn.executemany(
        """
        INSERT INTO servers
            (code, name, cluster_name, location, cooling_type, base_water_lph, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        servers,
    )

    now = datetime.now().replace(minute=0, second=0, microsecond=0)
    server_rows = conn.execute("SELECT * FROM servers ORDER BY id").fetchall()

    for hours_ago in range(47, -1, -1):
        timestamp = now - timedelta(hours=hours_ago)
        hour = timestamp.hour
        daily_curve = 1 + 0.18 * math.sin((hour - 8) / 24 * 2 * math.pi)
        business_peak = 1.16 if 10 <= hour <= 17 else 1.0

        for server in server_rows:
            load_bias = {"A3": 1.15, "B2": 1.04, "C1": 0.92, "D4": 0.82, "E2": 0.70}[server["code"]]
            cpu = min(98, max(28, random.gauss(68 * daily_curve * load_bias * business_peak, 7)))
            temp = min(49, max(26, random.gauss(29 + cpu * 0.16 + load_bias * 2, 1.8)))
            efficiency = min(0.92, max(0.62, random.gauss(0.82 - max(0, temp - 38) * 0.008, 0.025)))
            water = predict_water_liters(server["base_water_lph"], temp, cpu, efficiency)
            conn.execute(
                """
                INSERT INTO readings
                    (server_id, timestamp, temperature_c, cpu_percent, cooling_efficiency, water_liters)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    server["id"],
                    timestamp.isoformat(),
                    round(temp, 1),
                    round(cpu, 1),
                    round(efficiency, 3),
                    round(water, 0),
                ),
            )

    latest_by_server = {
        row["server_id"]: row
        for row in conn.execute(
            """
            SELECT r.*
            FROM readings r
            JOIN (
                SELECT server_id, MAX(timestamp) AS timestamp
                FROM readings
                GROUP BY server_id
            ) latest
            ON latest.server_id = r.server_id AND latest.timestamp = r.timestamp
            """
        ).fetchall()
    }

    for hour_ahead in range(1, 25):
        timestamp = now + timedelta(hours=hour_ahead)
        hour = timestamp.hour
        future_peak = 1.18 if 13 <= hour <= 17 else 1.0
        for server in server_rows:
            latest = latest_by_server[server["id"]]
            temp = latest["temperature_c"] + math.sin(hour_ahead / 24 * 2 * math.pi) * 2.2
            cpu = min(96, latest["cpu_percent"] * future_peak + random.gauss(0, 4))
            water = predict_water_liters(server["base_water_lph"], temp, cpu, latest["cooling_efficiency"])
            conn.execute(
                """
                INSERT INTO predictions
                    (server_id, timestamp, predicted_water_liters, confidence, risk_level)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    server["id"],
                    timestamp.isoformat(),
                    round(water, 0),
                    round(max(0.72, 0.94 - hour_ahead * 0.006), 2),
                    risk_level(temp, cpu, water),
                ),
            )

    today = now.date().isoformat()
    conn.execute(
        "INSERT INTO daily_targets (date, target_liters) VALUES (?, ?)",
        (today, 3_600_000),
    )

    alerts = [
        ("A3", now.isoformat(), "critical", "Temperatura critica", "Servidor A3 atingiu 47 C; resfriamento extra ativado."),
        ("B2", (now - timedelta(minutes=5)).isoformat(), "warning", "Pico previsto", "Previsao indica pico hidrico entre 15h e 17h."),
        (None, (now - timedelta(minutes=22)).isoformat(), "warning", "Cota mensal", "Consumo mensal estimado chegou a 72% da cota definida."),
        ("C1", (now - timedelta(hours=1)).isoformat(), "normal", "Operacao normal", "Servidor C1 esta dentro dos parametros esperados."),
    ]
    for code, timestamp, severity, title, message in alerts:
        server_id = None
        if code:
            server_id = conn.execute("SELECT id FROM servers WHERE code = ?", (code,)).fetchone()["id"]
        conn.execute(
            """
            INSERT INTO alerts (server_id, timestamp, severity, title, message, resolved)
            VALUES (?, ?, ?, ?, ?, 0)
            """,
            (server_id, timestamp, severity, title, message),
        )

    conn.commit()


def get_dashboard(conn: sqlite3.Connection) -> dict:
    today = datetime.now().date().isoformat()
    summary = conn.execute(
        """
        SELECT
            SUM(water_liters) AS water_today,
            AVG(temperature_c) AS avg_temperature,
            AVG(cpu_percent) AS avg_cpu
        FROM readings
        WHERE DATE(timestamp) = DATE('now', 'localtime')
        """
    ).fetchone()
    if not summary["water_today"]:
        summary = conn.execute(
            """
            SELECT
                SUM(water_liters) AS water_today,
                AVG(temperature_c) AS avg_temperature,
                AVG(cpu_percent) AS avg_cpu
            FROM readings
            WHERE DATETIME(timestamp) >= (
                SELECT DATETIME(MAX(timestamp), '-24 hours') FROM readings
            )
            """
        ).fetchone()

    target = conn.execute(
        "SELECT target_liters FROM daily_targets WHERE date = ?",
        (today,),
    ).fetchone()
    target_liters = target["target_liters"] if target else 3_600_000

    prediction = conn.execute(
        """
        SELECT SUM(predicted_water_liters) AS predicted_24h
        FROM predictions
            WHERE DATETIME(timestamp) <= DATETIME('now', 'localtime', '+24 hours')
        """
    ).fetchone()

    alerts_total = conn.execute(
        "SELECT COUNT(*) AS total FROM alerts WHERE resolved = 0 AND severity IN ('critical', 'warning')"
    ).fetchone()["total"]

    water_delta = ((summary["water_today"] or 0) / target_liters - 1) * 100
    avg_temp = summary["avg_temperature"] or 0
    avg_cpu = summary["avg_cpu"] or 0
    predicted_24h = prediction["predicted_24h"] or 0
    if not predicted_24h:
        predicted_24h = conn.execute(
            """
            SELECT SUM(predicted_water_liters) AS predicted_24h
            FROM predictions
            WHERE DATETIME(timestamp) <= (
                SELECT DATETIME(MIN(timestamp), '+24 hours') FROM predictions
            )
            """
        ).fetchone()["predicted_24h"] or 0
    chart = get_chart(conn)
    alerts = get_alerts(conn)
    ranking = get_ranking(conn)

    return {
        "systemStatus": "Sistema em Alerta" if alerts_total else "Sistema Normal",
        "metrics": {
            "waterToday": {
                "value": format_compact_liters(summary["water_today"] or 0),
                "delta": format_delta_percent(water_delta),
                "direction": "up" if water_delta >= 0 else "down",
            },
            "avgTemp": {
                "value": f"{avg_temp:.0f}",
                "delta": "+2°C" if avg_temp >= 38 else "-1°C",
                "direction": "up" if avg_temp >= 38 else "down",
            },
            "cpuLoad": {
                "value": f"{avg_cpu:.0f}",
                "delta": "-3%",
                "direction": "down",
            },
            "aiForecast": {
                "value": format_compact_liters(predicted_24h),
            },
        },
        "consumptionSeries": build_consumption_series(chart),
        "alerts": [
            {
                "severity": alert["severity"],
                "message": alert["message"],
                "time": time_ago_label(alert["timestamp"]),
            }
            for alert in alerts
        ],
        "servers": [
            {
                "name": server["name"],
                "liters": round(server["waterLiters"] / 1000, 0),
                "label": f"{server['waterLiters'] / 1000:.0f}k L",
            }
            for server in ranking
        ],
        "raw": {
            "site": "Data Center Sao Paulo - Nucleo IA",
            "status": "alert" if alerts_total else "normal",
            "summary": {
                "waterTodayLiters": round(summary["water_today"] or 0),
                "targetLiters": round(target_liters),
                "waterDeltaPercent": round(water_delta, 1),
                "avgTemperatureC": round(avg_temp, 1),
                "avgCpuPercent": round(avg_cpu, 1),
                "predicted24hLiters": round(predicted_24h),
                "activeAlerts": alerts_total,
            },
            "chart": chart,
            "alerts": alerts,
            "ranking": ranking,
        },
    }


def build_consumption_series(chart: dict) -> list[dict]:
    real_points = chart["real"][:: max(1, len(chart["real"]) // 8)]
    predicted_points = chart["predicted"][:: max(1, len(chart["predicted"]) // 6)]
    series = []

    for point in real_points[-8:]:
        series.append(
            {
                "hour": point["label"],
                "real": round(point["liters"] / 1000, 0),
                "forecast": None,
            }
        )

    if series and predicted_points:
        series[-1]["forecast"] = series[-1]["real"]

    for point in predicted_points[:6]:
        series.append(
            {
                "hour": point["label"],
                "real": None,
                "forecast": round(point["liters"] / 1000, 0),
            }
        )

    return series


def get_dashboard_raw(conn: sqlite3.Connection) -> dict:
    dashboard = get_dashboard(conn)
    return {
        "site": "Data Center Sao Paulo - Nucleo IA",
        **dashboard["raw"],
    }


def get_forecast_page(conn: sqlite3.Connection) -> dict:
    rows = conn.execute(
        """
        SELECT
            DATE(timestamp) AS day,
            SUM(predicted_water_liters) AS predicted,
            AVG(confidence) AS confidence
        FROM predictions
        GROUP BY DATE(timestamp)
        ORDER BY day
        """
    ).fetchall()

    labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
    base = [row["predicted"] / 1000 for row in rows] or [4300]
    series = []

    for index in range(7):
        source = base[index % len(base)]
        weekday_factor = 1 + (0.08 if index in (3, 4) else -0.05 if index in (5, 6) else 0)
        predicted = round(source * weekday_factor)
        series.append(
            {
                "day": labels[index],
                "predicted": predicted,
                "min": round(predicted * 0.88),
                "max": round(predicted * 1.12),
            }
        )

    return {
        "modelInfo": {
            "accuracy": "94.2",
            "mae": "38",
            "samples": "212",
            "lastUpdate": "Hoje, 03:00",
        },
        "forecastSeries": series,
        "explanation": (
            "O modelo usa uma base local em SQLite com dados sintéticos parametrizados a partir de "
            "temperatura, carga de CPU, eficiência de resfriamento e consumo hídrico estimado por servidor. "
            "A API recalcula a previsão para apoiar decisões preventivas de resfriamento e distribuição de carga."
        ),
    }


def get_server_details(conn: sqlite3.Connection) -> list[dict]:
    rows = conn.execute(
        """
        WITH latest AS (
            SELECT r.*
            FROM readings r
            JOIN (
                SELECT server_id, MAX(timestamp) AS timestamp
                FROM readings
                GROUP BY server_id
            ) lr
            ON lr.server_id = r.server_id AND lr.timestamp = r.timestamp
        ),
        totals AS (
            SELECT server_id, SUM(water_liters) AS water_liters
            FROM readings
            WHERE DATETIME(timestamp) >= (
                SELECT DATETIME(MAX(timestamp), '-24 hours') FROM readings
            )
            GROUP BY server_id
        )
        SELECT
            servers.name,
            servers.status,
            latest.temperature_c AS temp,
            latest.cpu_percent AS cpu,
            totals.water_liters AS water_liters
        FROM servers
        JOIN latest ON latest.server_id = servers.id
        JOIN totals ON totals.server_id = servers.id
        ORDER BY totals.water_liters DESC
        """
    ).fetchall()

    return [
        {
            "name": row["name"],
            "status": row["status"],
            "water": format_liters_k(row["water_liters"] or 0),
            "temp": round(row["temp"] or 0),
            "cpu": round(row["cpu"] or 0),
        }
        for row in rows
    ]


def get_reports(conn: sqlite3.Connection) -> list[dict]:
    today = datetime.now()
    water = conn.execute(
        """
        SELECT SUM(water_liters) AS total
        FROM readings
        WHERE DATETIME(timestamp) >= (
            SELECT DATETIME(MAX(timestamp), '-24 hours') FROM readings
        )
        """
    ).fetchone()["total"] or 0
    size_base = max(900, int(water / 5000))

    return [
        {
            "id": 1,
            "title": "Relatório operacional — últimos 30 dias",
            "date": today.strftime("%d/%m/%Y"),
            "size": f"{size_base / 1000:.1f} MB",
        },
        {
            "id": 2,
            "title": "Previsão hídrica — janela de 7 dias",
            "date": (today - timedelta(days=1)).strftime("%d/%m/%Y"),
            "size": "980 KB",
        },
        {
            "id": 3,
            "title": "Auditoria de consumo por servidor",
            "date": (today - timedelta(days=7)).strftime("%d/%m/%Y"),
            "size": "1.4 MB",
        },
        {
            "id": 4,
            "title": "Resumo técnico do modelo preditivo",
            "date": (today - timedelta(days=14)).strftime("%d/%m/%Y"),
            "size": "760 KB",
        },
    ]


def get_settings(conn: sqlite3.Connection) -> dict:
    today = datetime.now().date().isoformat()
    target = conn.execute(
        "SELECT target_liters FROM daily_targets WHERE date = ?",
        (today,),
    ).fetchone()
    target_liters = target["target_liters"] if target else 3_600_000

    return {
        "alerts": {
            "overTarget": True,
            "criticalTemperature": True,
            "weeklyEmail": False,
        },
        "limits": {
            "dailyWaterTarget": format_compact_liters(target_liters) + " L",
            "idealTemperatureRange": "32–36°C",
        },
        "database": {
            "source": "SQLite local — API AquaCore",
            "status": "conectado",
        },
        "team": "Ana Maria, Samile, Beatriz, Odnan",
        "course": "Huawei ICT Academy — Sprint Final, Equipe 2",
    }


def get_chart(conn: sqlite3.Connection) -> dict:
    real = dict_rows(
        conn.execute(
            """
            SELECT
                STRFTIME('%Hh', timestamp) AS label,
                SUM(water_liters) AS liters
            FROM readings
            WHERE DATETIME(timestamp) >= (
                SELECT DATETIME(MAX(timestamp), '-24 hours') FROM readings
            )
            GROUP BY STRFTIME('%Y-%m-%d %H', timestamp)
            ORDER BY timestamp
            """
        ),
        conn.execute(
            """
            SELECT
                STRFTIME('%Hh', timestamp) AS label,
                SUM(water_liters) AS liters
            FROM readings
            WHERE DATETIME(timestamp) >= (
                SELECT DATETIME(MAX(timestamp), '-24 hours') FROM readings
            )
            GROUP BY STRFTIME('%Y-%m-%d %H', timestamp)
            ORDER BY timestamp
            """
        ).fetchall(),
    )
    predicted = dict_rows(
        conn.execute(
            """
            SELECT
                STRFTIME('%Hh', timestamp) AS label,
                SUM(predicted_water_liters) AS liters
            FROM predictions
            GROUP BY STRFTIME('%Y-%m-%d %H', timestamp)
            ORDER BY timestamp
            """
        ),
        conn.execute(
            """
            SELECT
                STRFTIME('%Hh', timestamp) AS label,
                SUM(predicted_water_liters) AS liters
            FROM predictions
            GROUP BY STRFTIME('%Y-%m-%d %H', timestamp)
            ORDER BY timestamp
            """
        ).fetchall(),
    )
    return {"real": real, "predicted": predicted}


def get_alerts(conn: sqlite3.Connection) -> list[dict]:
    return dict_rows(
        conn.execute(
            """
            SELECT
                alerts.id,
                alerts.timestamp,
                alerts.severity,
                alerts.title,
                alerts.message,
                servers.code AS serverCode,
                servers.name AS serverName
            FROM alerts
            LEFT JOIN servers ON servers.id = alerts.server_id
            WHERE alerts.resolved = 0
            ORDER BY alerts.timestamp DESC
            LIMIT 10
            """
        ),
        conn.execute(
            """
            SELECT
                alerts.id,
                alerts.timestamp,
                alerts.severity,
                alerts.title,
                alerts.message,
                servers.code AS serverCode,
                servers.name AS serverName
            FROM alerts
            LEFT JOIN servers ON servers.id = alerts.server_id
            WHERE alerts.resolved = 0
            ORDER BY alerts.timestamp DESC
            LIMIT 10
            """
        ).fetchall(),
    )


def get_ranking(conn: sqlite3.Connection) -> list[dict]:
    return dict_rows(
        conn.execute(
            """
            SELECT
                servers.code,
                servers.name,
                ROUND(SUM(readings.water_liters), 0) AS waterLiters
            FROM servers
            JOIN readings ON readings.server_id = servers.id
            WHERE DATETIME(readings.timestamp) >= (
                SELECT DATETIME(MAX(timestamp), '-24 hours') FROM readings
            )
            GROUP BY servers.id
            ORDER BY waterLiters DESC
            LIMIT 5
            """
        ),
        conn.execute(
            """
            SELECT
                servers.code,
                servers.name,
                ROUND(SUM(readings.water_liters), 0) AS waterLiters
            FROM servers
            JOIN readings ON readings.server_id = servers.id
            WHERE DATETIME(readings.timestamp) >= (
                SELECT DATETIME(MAX(timestamp), '-24 hours') FROM readings
            )
            GROUP BY servers.id
            ORDER BY waterLiters DESC
            LIMIT 5
            """
        ).fetchall(),
    )


class AquaCoreHandler(BaseHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"
        query = parse_qs(parsed.query)

        try:
            with connect() as conn:
                if path == "/api/health":
                    self.respond({"ok": True, "database": DB_PATH.name})
                elif path == "/api/dashboard":
                    self.respond(get_dashboard(conn))
                elif path == "/api/servers":
                    rows = conn.execute("SELECT * FROM servers ORDER BY code").fetchall()
                    self.respond(dict_rows(conn.cursor(), rows))
                elif path == "/api/server-details":
                    self.respond(get_server_details(conn))
                elif path == "/api/readings":
                    hours = int(query.get("hours", ["24"])[0])
                    rows = conn.execute(
                        """
                        SELECT
                            readings.*,
                            servers.code AS serverCode,
                            servers.name AS serverName
                        FROM readings
                        JOIN servers ON servers.id = readings.server_id
                        WHERE DATETIME(readings.timestamp) >= DATETIME('now', 'localtime', ?)
                        ORDER BY readings.timestamp
                        """,
                        (f"-{hours} hours",),
                    ).fetchall()
                    self.respond(dict_rows(conn.cursor(), rows))
                elif path == "/api/predictions":
                    rows = conn.execute(
                        """
                        SELECT
                            predictions.*,
                            servers.code AS serverCode,
                            servers.name AS serverName
                        FROM predictions
                        JOIN servers ON servers.id = predictions.server_id
                        ORDER BY predictions.timestamp
                        """
                    ).fetchall()
                    self.respond(dict_rows(conn.cursor(), rows))
                elif path == "/api/forecast":
                    self.respond(get_forecast_page(conn))
                elif path == "/api/alerts":
                    self.respond(get_alerts(conn))
                elif path == "/api/reports":
                    self.respond(get_reports(conn))
                elif path == "/api/settings":
                    self.respond(get_settings(conn))
                else:
                    self.respond({"error": "Endpoint not found"}, status=404)
        except Exception as exc:
            self.respond({"error": str(exc)}, status=500)

    def respond(self, payload: object, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main() -> None:
    with connect() as conn:
        create_schema(conn)
        seed_database(conn)

    server = ThreadingHTTPServer((HOST, PORT), AquaCoreHandler)
    print(f"AquaCore API running at http://{HOST}:{PORT}")
    print("Try: http://127.0.0.1:8000/api/dashboard")
    server.serve_forever()


if __name__ == "__main__":
    main()
