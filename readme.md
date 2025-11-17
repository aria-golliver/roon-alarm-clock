A simple roon alarm clock app - all this does is hit play on a hard-coded roon zone.

Important: There must be something in the play queue for it to actually work :P

[./init-repo.sh](./init-repo.sh) will help you install all the tools and give an example crontab.

you can also run [./install.sh BINARY_NAME](./install.sh) to create a single binary using `bun`

`tail -f /var/log/syslog | grep roon` to peep the logs

[official roon api / docs here](https://github.com/RoonLabs/node-roon-api)

I wrapped the roon functions I used in promises because it makes it way easier to reason about.
It's an alarm clock, it's not that serious anyway.
How long did JS programmers spend suffering with callbacks-in-callbacks-in-callbacks?