# Observability Implementation Plan

## Current State Analysis
The application currently **lacks** a production-grade observability setup.
- **Dependencies**: No direct OpenTelemetry or metrics libraries are installed in `package.json`. `@opentelemetry/api` exists only as a transitive dependency.
- **Infrastructure**: `docker-compose.yml` only includes Postgres, Redis, and PgAdmin. There are no services for collecting or visualizing telemetry data (e.g., Jaeger, Prometheus, Grafana).

## Proposed Solution
We will implement a complete observability stack using **OpenTelemetry (OTel)** for instrumentation and a suite of tools for storage and visualization. This ensures the application is "production-ready" with standard industry practices.

### 1. Application Instrumentation (Node.js)
We will auto-instrument the Node.js application to capture traces and metrics without significant code changes.
- **Libraries**:
    - `@opentelemetry/sdk-node`: The main SDK.
    - `@opentelemetry/auto-instrumentations-node`: For automatic instrumentation of common modules (Express, Pg, Http, etc.).
    - `@opentelemetry/exporter-trace-otlp-http` / `@opentelemetry/exporter-metrics-otlp-http`: To send data to the collector.
- **Configuration**: Create a `src/instrumentation.ts` file to initialize the SDK and export data to the OpenTelemetry Collector.

### 2. Infrastructure (Docker Compose)
We will add the following services to `docker-compose.yml`:
- **OpenTelemetry Collector**: Receives traces and metrics from the app, processes them, and exports them to backends.
- **Jaeger**: For distributed tracing visualization.
- **Prometheus**: For storing metrics.
- **Grafana**: For visualizing metrics (dashboards).

### 3. Configuration Files
- **`otel-collector-config.yaml`**: defines receivers (OTLP), processors (batch), and exporters (Jaeger, Prometheus).
- **`prometheus.yml`**: Configures Prometheus to scrape the Collector.

## Implementation Steps

### Step 1: Install Dependencies
```bash
npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/api @opentelemetry/exporter-trace-otlp-proto @opentelemetry/exporter-metrics-otlp-proto @opentelemetry/resources @opentelemetry/semantic-conventions
```

### Step 2: Create Instrumentation Init File
Create `src/instrumentation.ts` to set up the NodeSDK with OTLP exporters pointing to the collector.

### Step 3: Update Entry Point
Modify `package.json` scripts or the application entry point to preload the instrumentation before the app starts.
e.g., `node --require ./dist/instrumentation.js dist/app.js`

### Step 4: Add Docker Services
Update `docker-compose.yml` to include:
- `otel-collector`
- `jaeger`
- `prometheus`
- `grafana`

### Step 5: Verify
- Run `docker-compose up -d`.
- Run the existing `load-test.js` to generate traffic.
- Check Jaeger UI (http://localhost:16686) for traces.
- Check Prometheus (http://localhost:9090) for targets.
- Check Grafana (http://localhost:3000) for metrics.

## User Review Required
- **Port Mapping**: The new services will expose ports 16686 (Jaeger), 9090 (Prometheus), 3000 (Grafana). Ensure these don't conflict.
- **Resource Usage**: Running this full stack locally consumes more memory.
