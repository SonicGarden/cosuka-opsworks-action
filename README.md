# Cosuka Opesworks GitHub Action

## Usage:

### Inputs
- `token` - The GITHUB_TOKEN secret.

### Example

```yaml
name: Crontab diff

on:
  pull_request:
    paths:
      - config/schedule.rb

jobs:
  new-gems:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: ruby/setup-ruby@v1
        with:
          bundler-cache: true
      - uses: SonicGarden/cosuka-opsworks-action@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```
