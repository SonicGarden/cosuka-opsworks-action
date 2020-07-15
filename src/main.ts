import * as fs from 'fs'
import * as os from 'os'
import * as core from '@actions/core'
import * as github from '@actions/github'
import replaceComment from '@aki77/actions-replace-comment'
import execa, {command} from 'execa'

const outputCrontab = async (path: string): Promise<void> => {
  const subprocess = execa(
    'bundle',
    ['exec', 'rake', 'cosuka_opsworks:output_cron'],
    {
      env: {DISABLE_SPRING: 'true'}
    }
  )
  subprocess.stdout?.pipe(fs.createWriteStream(path))
  await subprocess
}

const getDiff = async (baseRef: string): Promise<string> => {
  const HEAD_CRONTAB = '/tmp/head_crontab.txt'
  const BASE_CRONTAB = '/tmp/base_crontab.txt'

  await outputCrontab(HEAD_CRONTAB)

  await execa('git', ['fetch', 'origin', baseRef])
  const subProcess = execa('git', [
    'show',
    `remotes/origin/${process.env.GITHUB_BASE_REF}:config/schedule.rb`
  ])
  subProcess.stdout?.pipe(fs.createWriteStream('config/schedule.rb'))
  await subProcess

  await outputCrontab(BASE_CRONTAB)

  try {
    await command(`diff -u ${BASE_CRONTAB} ${HEAD_CRONTAB}`)
    return ''
  } catch (error) {
    if (error.stdout) {
      return error.stdout
    }
    throw error
  }
}

const CODE = '```'

async function run(): Promise<void> {
  try {
    if (!process.env.GITHUB_BASE_REF) {
      throw new Error('GITHUB_BASE_REF is undefined.')
    }

    const diff = await getDiff(process.env.GITHUB_BASE_REF)
    if (diff === '') {
      core.debug('No diff.')
      return
    }

    const normalizedDiff = diff
      .split('\n')
      .slice(4)
      .join('\n')
      .replace(new RegExp(os.hostname(), 'g'), 'HOSTNAME')
      .replace(new RegExp(process.cwd(), 'g'), 'PROJECT_DIR')

    const body = `## :warning: Crontab Diff!

<details>
<summary>Diff</summary>

${CODE}diff
${normalizedDiff}
${CODE}
</details>
`

    const data = await replaceComment({
      token: core.getInput('token', {required: true}),
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      // eslint-disable-next-line @typescript-eslint/camelcase
      issue_number: github.context.issue.number,
      body
    })

    if (!data) {
      core.debug('Already commented.')
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
