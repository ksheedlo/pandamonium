pandamonium
===========

![](http://e226c44521bc93014891-95071af5d2ef5fa7fb6048ccd0393c38.r12.cf1.rackcdn.com/panda-licking-chops.gif)

The panda-themed psuedomonitoring tool. Allows you to random entities, checks,
alarms, notification plans and suppressions in Rackspace Cloud Monitoring.

## Installation

The best way to install pandamonium is with NPM.

```
$ npm install -g pandamonium
```

## Supported commands

Pandamonium exposes all commands through a single binary, `pm`. For NPM installs
this will be under your NPM prefix. When developing Pandamonium, you can find the
binary at `./bin/pm` from the root of the repo.

All pandamonium commands take the following form:

```
$ pm [TYPE] create [OPTIONS]
```

Pandamonium can be used to create, but not to destroy. This is important because
you can quickly overrun your account's Cloud Monitoring limits for checks or alarms. To view, edit and delete the resources that Pandamonium provisions, go
to the UI at [Rackspace Cloud Intelligence](https://intelligence.rackspace.com) or
roll your own API client.

### Entities

### Checks

### Alarms

### Notifications

### Notification plans

### Suppressions

## Configuration

By default, pandamonium looks for a `.pmrc` file in your home directory. You can
set the environment variable `PM_SETTINGS` that contains a file path that
pandamonium should use instead. This file should be a JSON object containing the
following contents:

- `username` - Your Rackspace username. This is a required option.
- `api_key` - Your Rackspace API key. This is also required.
- `identity_endpoint` - An alternative identity endpoint to use instead of
    the Rackspace default identity endpoint. This is useful for running
    pandamonium against alternative backends such as
    [Mimic](https://github.com/rackerlabs/mimic). If not set, pandamonium
    will use [Rackspace Cloud Identity](http://docs.rackspace.com/auth/api/v2.0/auth-client-devguide/content/Overview-d1e65.html).
- `tenant_id` - Your Rackspace account number. This is not necessary when
    authenticating against Rackspace Cloud Identity, but it helps alternative
    backend services generate the correct endpoints. In particular, it is
    necessary when running both pandamonium and Cloud Intelligence against Mimic.

Here's an example.

```js
{
  "username": "PandaAwesome",
  "api_key": "ca3ec4b27bb98d54bda97627bb1b447e",
  "identity_endpoint": "http://localhost:8900/identity/v2.0/tokens",
  "tenant_id": "123456"
}
```

## Contributing

## License

MIT
