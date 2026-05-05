import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { NamedReporterContract } from '@japa/runner/types'

type TestResult = {
  suitePath: string[]
  suite: string
  suiteRoot: string
  title: string
  status: 'passed' | 'failed' | 'skipped' | 'todo'
  duration: number
  errorMessage: string | null
}

type HtmlReporterOptions = {
  outputFile?: string
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function toUtcPlus1ISOString(date: Date) {
  const shifted = new Date(date.getTime() + 60 * 60 * 1000)
  return shifted.toISOString().replace('Z', ' UTC+01:00')
}

export function htmlReporter(options: HtmlReporterOptions = {}): NamedReporterContract {
  const outputFile = options.outputFile ?? path.join(process.cwd(), 'test-results', 'report.html')

  return {
    name: 'html',
    async handler(_runner, emitter) {
      const suiteStack: string[] = []
      const tests: TestResult[] = []
      const startedAt = new Date()

      emitter.on('suite:start', (suite) => {
        suiteStack.push(suite.name)
      })

      emitter.on('suite:end', () => {
        suiteStack.pop()
      })

      emitter.on('test:end', (test) => {
        const status = test.isSkipped
          ? 'skipped'
          : test.isTodo
            ? 'todo'
            : test.hasError
              ? 'failed'
              : 'passed'
        const firstError = test.errors[0]?.error?.message ?? null

        const suitePath = suiteStack.length ? [...suiteStack] : ['unknown']
        const suiteRoot = suitePath[0] ?? 'unknown'

        tests.push({
          suitePath,
          suite: suitePath.join(' / '),
          suiteRoot,
          title: test.title.expanded,
          status,
          duration: test.duration,
          errorMessage: firstError,
        })
      })

      emitter.on('runner:end', async () => {
        const total = tests.length
        const passed = tests.filter((t) => t.status === 'passed').length
        const failed = tests.filter((t) => t.status === 'failed').length
        const skipped = tests.filter((t) => t.status === 'skipped').length
        const todo = tests.filter((t) => t.status === 'todo').length
        const duration = Math.max(Date.now() - startedAt.getTime(), 0)

        const longestTest = tests.reduce<TestResult | null>(
          (acc, test) => (acc === null || test.duration > acc.duration ? test : acc),
          null
        )

        const renderRows = (items: TestResult[]) =>
          items
            .map((test) => {
              const error = test.errorMessage
                ? `<pre class="error">${escapeHtml(test.errorMessage)}</pre>`
                : ''

              return `<tr>
  <td>${escapeHtml(test.suite)}</td>
  <td>${escapeHtml(test.title)}</td>
  <td class="status ${test.status}">${test.status}</td>
  <td>${test.duration}ms</td>
  <td>${error}</td>
</tr>`
            })
            .join('\n')

        const functionalTests = tests.filter((t) => t.suiteRoot === 'functional')
        const unitTests = tests.filter((t) => t.suiteRoot === 'unit')
        const otherTests = tests.filter((t) => !['functional', 'unit'].includes(t.suiteRoot))

        const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Test Report</title>
  <style>
    body { font-family: Inter, Arial, sans-serif; margin: 24px; color: #1f2937; }
    h1 { margin-bottom: 8px; }
    .meta { color: #6b7280; margin-bottom: 16px; }
    .section { margin-top: 22px; }
    .section h2 { margin: 0 0 10px; font-size: 16px; }
    .summary { display: flex; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }
    .badge { padding: 8px 12px; border-radius: 8px; font-weight: 600; }
    .total { background: #e5e7eb; }
    .passed { background: #dcfce7; color: #166534; }
    .failed { background: #fee2e2; color: #991b1b; }
    .skipped { background: #fef3c7; color: #92400e; }
    .todo { background: #e0e7ff; color: #3730a3; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 10px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
    th { background: #f9fafb; }
    .status { text-transform: uppercase; font-size: 12px; font-weight: 700; letter-spacing: 0.03em; }
    pre.error { white-space: pre-wrap; margin: 0; color: #991b1b; font-size: 12px; }
  </style>
</head>
<body>
  <h1>Test Report</h1>
  <div class="meta">Generated at ${toUtcPlus1ISOString(new Date())} (timezone: UTC+01:00) - duration ${duration}ms</div>
  ${
    longestTest
      ? `<div class="meta">Longest test: ${escapeHtml(longestTest.suite)} → ${escapeHtml(longestTest.title)} (${longestTest.duration}ms)</div>`
      : ''
  }
  <div class="summary">
    <div class="badge total">Total: ${total}</div>
    <div class="badge passed">Passed: ${passed}</div>
    <div class="badge failed">Failed: ${failed}</div>
    <div class="badge skipped">Skipped: ${skipped}</div>
    <div class="badge todo">Todo: ${todo}</div>
  </div>
  <div class="section">
    <h2>Functional (${functionalTests.length})</h2>
    <table>
      <thead>
        <tr>
          <th>Suite</th>
          <th>Test</th>
          <th>Status</th>
          <th>Duration</th>
          <th>Error</th>
        </tr>
      </thead>
      <tbody>
${renderRows(functionalTests)}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Unit (${unitTests.length})</h2>
    <table>
      <thead>
        <tr>
          <th>Suite</th>
          <th>Test</th>
          <th>Status</th>
          <th>Duration</th>
          <th>Error</th>
        </tr>
      </thead>
      <tbody>
${renderRows(unitTests)}
      </tbody>
    </table>
  </div>

  ${
    otherTests.length
      ? `<div class="section">
    <h2>Other (${otherTests.length})</h2>
    <table>
      <thead>
        <tr>
          <th>Suite</th>
          <th>Test</th>
          <th>Status</th>
          <th>Duration</th>
          <th>Error</th>
        </tr>
      </thead>
      <tbody>
${renderRows(otherTests)}
      </tbody>
    </table>
  </div>`
      : ''
  }
</body>
</html>`

        await mkdir(path.dirname(outputFile), { recursive: true })
        await writeFile(outputFile, html, 'utf8')
        console.log(`HTML report written to ${outputFile}`)
      })
    },
  }
}
