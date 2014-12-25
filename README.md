pandamonium ![](https://travis-ci.org/ksheedlo/pandamonium.svg?branch=master)
===========

![](http://e226c44521bc93014891-95071af5d2ef5fa7fb6048ccd0393c38.r12.cf1.rackcdn.com/panda-licking-chops.gif)

The panda-themed pseudomonitoring tool. Allows you to randomly create entities,
checks, alarms, notification plans and suppressions in Rackspace Cloud
Monitoring.

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

**Important:** pandamonium is a stupid tool. It doesn't understand human-readable
labels, and needs raw object IDs from Cloud Monitoring when you specify Cloud
Monitoring objects to any pandamonium command. For instance, you need to use
`en123ABC` instead of `cloud-server-01`. When you specify a list of Cloud
Monitoring objects to pandamonium, use a comma-separated list of object IDs. For
example, this command specifies two entities and two alarms to
`pm suppressions create`:

```
$ pm suppressions create --entities=en123ABC,en456DEF --alarms=al321BAZ,al911FOO
```

If you have a Cloud Monitoring object and don't know the ID, Cloud Intelligence
is the best place to look it up.

### Entities

```
$ pm entities create [-n COUNT]
```

Creates entities with random labels and IP addresses. To create many entities
at once, pass the `-n` or `--count` option. This is an integer specifying how
many entities to create. For instance,

```
$ pm entities create -n 500
```

creates 500 entities.

### Checks

```
pm checks create [-e, --entity ENTITY] [--spread] [-n COUNT]
```

Creates checks with random labels, check types, check details and host names.
To specify an entity to create checks under, pass the `-e` or `--entity` option.
To create many checks at once, pass the `-n` or `--count` option as an integer
number of checks to create. The `--spread` option controls how the checks will
be distributed in the case where `ENTITY` is not specified and `COUNT > 1`. In
this case, if `--spread` is passed, checks will be distributed randomly to all
of the user's entities; otherwise, pandamonium will randomly select one entity
and create all the checks under it.

### Alarms

```
pm alarms create [-e, --entity ENTITY] [-c, --checks CHECKS] [-p, --notification_plans PLANS] [--spread] [-n COUNT]
```

Creates alarms with random labels and alarm criteria. To specify an entity to
create alarms under, pass the `-e` or `--entity` option. To specify a list of
check IDs to associate alarms with, pass the `-c` or `--checks` option. To
specify a list of notification plans to use, pass the `-p` or
`--notification_plans` option. To create many alarms at once, pass the `-n` or
`--count` option as an integer number of alarms to create. The `--spread` option
controls how the alarms will be distributed in the case where `CHECKS` is not
specified or is a list of length greater than 1. In this case, `--spread`
specifies that alarms should be distributed randomly to all checks in the list
or all checks associated with the entity that is specified or that pandamonium
chooses (when the entity is not specified).

### Notifications

```
pm notifications create [-n COUNT]
```

Creates notifications with random labels, types and details. To create many
notifications at once, specify the `-n` or `--count` option as an integer
number of notifications to create.

### Notification plans

```
pm notification_plans create [--notifications NOTIFICATIONS] [-n COUNT]
```

Creates notification plans with random labels. To specify a list of
notifications to use in each plan, pass the `--notifications` option.
If this option is not passed a random selection of notifications will be used
for each new plan. To create many notification plans at once, pass the `-n` or
`--count` option as an integer number of notification plans to create.

### Suppressions

```
pm suppressions create [--entities ENTITIES] [--alarms ALARMS] [--checks CHECKS] [--notification_plans PLANS] [--start_time START] [--end_time END] [--spread] [-n COUNT]
```

Creates suppressions with random labels. Suppressables are passed in using the
`--entities`, `--alarms`, `--checks`, and `--notification_plans` options.
Arguments for these options should be lists of IDs. If no suppressables are
specified and the `--spread` option is passed, suppressions are applied randomly
to the user's entities. If no suppressables are specified and the `--spread`
option is not passed, a random entity is chosen and all suppressions are applied
to that entity. If `--start_time` is present, suppressions will start at `START`,
and if `--end_time` is present, suppressions will end at `END`. Otherwise, a
random time bound will be chosen. To create many suppressions at once, pass
the `-n` or `--count` option as an integer number of suppressions to create.

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

Pull requests are welcome! Just do your best to follow the existing conventions
and document any new features or behavior you add.

We use [jshint](http://jshint.com/docs/) for linting and [Mocha](http://mochajs.org/)
to run unit tests. You can check both in development by running `npm test`. If you
make sure your code is lint free and add unit tests for any new features or bug
fixes you submit, it'll help me merge your PR faster!

## License

MIT
