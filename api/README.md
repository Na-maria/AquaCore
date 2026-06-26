# AquaCore API local

API local para o dashboard React do AquaCore. Ela usa Python e SQLite nativo, sem dependencias externas.

## Como rodar

```bash
python aquacore-api/server.py
```

A API fica em:

```txt
http://127.0.0.1:8000
```

## Endpoints principais

```txt
GET /api/health
GET /api/dashboard
GET /api/servers
GET /api/readings?hours=24
GET /api/predictions
GET /api/alerts
```

O endpoint mais util para o React e:

```txt
GET http://127.0.0.1:8000/api/dashboard
```

Ele retorna:

- resumo do consumo hidrico;
- temperatura media;
- carga media de CPU;
- previsao das proximas 24h;
- dados do grafico real vs previsao;
- alertas em tempo real;
- ranking de consumo por servidor.

## Exemplo no React

```js
async function loadDashboard() {
  const response = await fetch("http://127.0.0.1:8000/api/dashboard");
  const data = await response.json();
  return data;
}
```

## Como explicar na banca

O AquaCore usa uma base local SQLite com dados sinteticos parametrizados para simular leituras operacionais de um data center. A previsao hidrica e calculada por um modelo explicavel que considera temperatura, carga de CPU, eficiencia do resfriamento e consumo-base de cada servidor.

Essa arquitetura separa frontend, API, banco e modulo preditivo, permitindo migracao futura para uma infraestrutura cloud quando houver acesso ao ambiente Huawei Cloud.
