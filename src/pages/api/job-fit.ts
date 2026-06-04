export const prerender = false;
import type { APIRoute } from 'astro';

const CANDIDATE = `
Anupam Ojha — Senior Platform & Infrastructure Engineer, SFO Bay Area
15+ years experience as a Staff Software Engineer

SUMMARY: Expert in Kubernetes orchestration, OpenTelemetry observability, DevSecOps, and incident command for mission-critical cloud environments.

SKILLS:
- Cloud & Platform: AWS, GCP, Kubernetes, Docker, Terraform, Crossplane, Istio Service Mesh
- Observability: OpenTelemetry, Grafana, Prometheus, Datadog, Honeycomb
- Languages: Java, Go, Python, Spring Boot, gRPC, GraphQL, Kafka
- CI/CD & Security: GitHub Actions, ArgoCD, Jenkins, Chainguard (Image Hardening), SAST
- Databases: Postgres, YugabyteDB, Redis, MongoDB, MySQL

EXPERIENCE:
Ford Motor Company — Senior Software Engineer (Jun 2022 – Present)
- Standardized enterprise observability with OpenTelemetry libraries in Java and Go; built PII redaction and local Otel testing library
- Led platform orchestration migration from KubeVela to custom OAM-based hydrator (Yugabyte, Pulsar, Redis)
- Enforced secure-by-default pipelines with Chainguard image hardening and build-breaker security policies (CSP/XFO/HSTS)
- Reduced command cancellations 33% via pod-based internal load balancing
- Served as Incident Commander for platform outages

GE Healthcare — Staff Software Engineer (May 2019 – Jun 2022)
- Led hospital monitoring microservices teams at Tampa General Hospital and OHSU Portland
- Gremlin chaos engineering, Spring Batch/RabbitMQ EMR/EHR pipelines, GraphQL ML data stores

Consulting (2010–2019): Citi Group, Verizon, US Bank, Daimler Trucks, Southwest Airlines (via TCS/Syntel/Synechron/Disys/Norgate)
- Migrated monoliths to Spring Boot, led Sabre-to-Amadeus reservation migration, IBM MQ integrations

EDUCATION:
- MS Computer Science (Data Science), University of Illinois Urbana-Champaign (GPA 3.8)
- BTech Electronics & Communications Engineering, SRM University

NOTABLE PROJECT: Built Sentinel — an autonomous CVE remediation agent that forks repos, patches build files and source code via LLM, verifies in an isolated Docker sandbox, and opens PRs automatically. Supports Java (Maven/Gradle) and Python.
`.trim();

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  if (!body?.jobDescription) {
    return new Response(JSON.stringify({ error: 'Missing jobDescription' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = import.meta.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ fallback: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `You are evaluating a candidate for a job opening. Be direct and concise (4-5 sentences max).

Candidate profile:
${CANDIDATE}

Job description:
${body.jobDescription}

Provide: (1) a clear verdict — "Strong match", "Partial match", or "Unlikely match" — with a one-line reason, (2) the top 2 matching strengths, (3) any notable gaps. Be specific, not generic.`,
      }],
    }),
  });

  if (!res.ok) {
    return new Response(JSON.stringify({ fallback: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await res.json();
  return new Response(
    JSON.stringify({ analysis: data.content?.[0]?.text ?? 'No analysis available.' }),
    { headers: { 'Content-Type': 'application/json' } },
  );
};
