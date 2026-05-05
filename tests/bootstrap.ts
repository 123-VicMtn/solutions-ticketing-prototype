import { assert } from '@japa/assert'
import { apiClient } from '@japa/api-client'
import app from '@adonisjs/core/services/app'
import type { Config } from '@japa/runner/types'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'
import testUtils from '@adonisjs/core/services/test_utils'
import { htmlReporter } from '#tests/reporters/html_reporter'
import { spawn } from 'node:child_process'

/**
 * This file is imported by the "bin/test.ts" entrypoint file
 */

/**
 * Configure Japa plugins in the plugins array.
 * Learn more - https://japa.dev/docs/runner-config#plugins-optional
 */
export const plugins: Config['plugins'] = [assert(), apiClient(), pluginAdonisJS(app)]

/**
 *  * Register available reporters. The HTML reporter can be activated via:
 * node ace test --reporters=html
 */
export const reporters: Config['reporters'] = {
  activated: [],
  list: [htmlReporter()],
}

/**
 * Configure lifecycle function to run before and after all the
 * tests.
 *
 * The setup functions are executed before all the tests
 * The teardown functions are executed after all the tests
 */
export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [
    async () => {
      /**
       * Ensure DB schema exists for functional tests.
       * - In CI, migrations are executed explicitly by the workflow.
       * - In Docker, you may choose to do it explicitly too.
       * - In local IDE runs, this keeps tests runnable out of the box.
       */
      if (process.env.RUN_MIGRATIONS !== 'true') return

      await new Promise<void>((resolve, reject) => {
        const child = spawn(process.execPath, ['ace', 'migration:run'], {
          stdio: 'inherit',
          env: process.env,
        })

        child.on('exit', (code) => {
          if (code === 0) resolve()
          else reject(new Error(`migration:run failed with exit code ${code}`))
        })
        child.on('error', reject)
      })
    },
  ],
  teardown: [],
}

/**
 * Configure suites by tapping into the test suite instance.
 * Learn more - https://japa.dev/docs/test-suites#lifecycle-hooks
 */
export const configureSuite: Config['configureSuite'] = (suite) => {
  if (['browser', 'functional', 'e2e'].includes(suite.name)) {
    return suite.setup(() => testUtils.httpServer().start())
  }
}
