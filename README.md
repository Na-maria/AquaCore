# AquaCore Dashboard

Dashboard React do AquaCore com múltiplas páginas e API local em Python + SQLite.

## Rodar a API local

```bash
npm run api
```

A API fica em:

```txt
http://127.0.0.1:8000/api/dashboard
```

## Rodar o React

Em outro terminal:

```bash
npm run dev
```

O dashboard fica em:

```txt
http://localhost:5173
```

## Stack

- React + Vite
- React Router
- Recharts
- Lucide React
- API local em Python
- SQLite

## Observacao para apresentacao

O projeto usa SQLite como ambiente local de prototipacao. A arquitetura separa frontend, API, banco e modulo preditivo, permitindo migracao futura para cloud quando houver acesso ao ambiente Huawei Cloud.
