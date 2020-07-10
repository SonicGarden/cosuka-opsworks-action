import * as core from '@actions/core'
import {command} from 'execa'

const getCrontab = async (): Promise<string> => {
  const {stdout} = await command(
    'bundle exec rake cosuka_opsworks:output_cron',
    {
      env: {RAILS_ENV: 'test', DISABLE_SPRING: 'true'}
    }
  )
  return stdout
}

async function run(): Promise<void> {
  try {
    const newCrontab = await getCrontab()
    core.debug(newCrontab)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
