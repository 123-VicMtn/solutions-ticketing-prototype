import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { NamedReporterContract } from '@japa/runner/types'

type TestResult = {
  suite: string
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

        tests.push({
          suite: suiteStack[suiteStack.length - 1] ?? 'unknown',
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

        const rows = tests
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
  <div class="meta">Generated at ${new Date().toISOString()} - duration ${duration}ms</div>
  <div class="summary">
    <div class="badge total">Total: ${total}</div>
    <div class="badge passed">Passed: ${passed}</div>
    <div class="badge failed">Failed: ${failed}</div>
    <div class="badge skipped">Skipped: ${skipped}</div>
    <div class="badge todo">Todo: ${todo}</div>
  </div>
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
${rows}
    </tbody>
  </table>
</body>
</html>`

        await mkdir(path.dirname(outputFile), { recursive: true })
        await writeFile(outputFile, html, 'utf8')
        console.log(`HTML report written to ${outputFile}`)
      })
    },
  }
}
