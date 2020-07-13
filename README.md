# Cosuka Opesworks GitHub Action

![Demo](https://i.gyazo.com/d40835b0c51f48ed14bb8216d8056ceb.png)]

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
  cosuka-opsworks:
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
