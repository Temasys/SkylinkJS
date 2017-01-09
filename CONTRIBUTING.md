## Committing to the Temasys SkylinkJS branch

For developers who wants to contribute to the source code, you would require to fork your own repostiory and create a pull-request to a new branch.

Branch name format: `#< TICK_NO >-FEATURE_NAME`.

For example, if I'm fixing a bug for safari's video stream, I'll have a branch name called `#12-bugfix-safari-video`. If there is any tickets relating to the feature, do put a ticket for it.

Alternatively, you may just simply have your branch name `FEATURE_NAME` if this is for improvements to the code structure. But it is usually recommended to open a new ticket in github, linking the branch to the ticket number and pushing it.

All pull-requests requires a descripttion on what changes are made.

Please pull-request to `0.6.x-development` branch as it will assist in easier development.

##### Commit message format

Here's the format to push commits into Skylink:

`[Ticket][Type: DOC|DEMO|STY|ENH|REF|DEP|BUG|OTH][WIP|<null>]: Commit name`

- `DOC` : This commit is related to documentation changes.
- `DEMO` : This commit is related to demo changes.
- `STY` : This commit is related to interface styling changes.
- `ENH` : This commit is related to an enhancement of a feature or new feature. Some improvements.
- `REF` : This commit is to upgrade the dependencies reference or changes to the references in Skylink.
- `DEP` : This commit is to upgrade the dependencies. _e.g. socket.io-client 1.2.1 upgrade_
- `BUG` : This commit is to fix a bug.
- `WIP` : This commit related to the ticket state is still in progress. Incomplete
- `OTH` : This commit has no grouping.

Commit message format examples:

- Commit that's a new feature but still in progress<br>
  `[#12][ENH][WIP]: New feature in progress.`<br>
- Commit that's a bug fix that has been completed<br>
  `[#15][BUG]: Fix for new bug found.`

## Temasys SkylinkJS code demos
In the `demo` folder, it contains the following code samples for developers to test and try on. You will require to create your own `config.js` file and setup with your own App Key CORS url tied to the `localhost` or your own local network IP address (whichever way you like it). Check the `config-example.js` file in the `demo` folder on how to configure the `config.js` file. Once you are done, save it in the `demo` folder.

Here's the list of sample demos available:

- `app`: The demo that tests all of Temasys SkylinkJS functionalities.
- `simple-app`: The demo that tests a simple peer-to-peer video call functionalities.
- `chat-room`: The demo that tests on the chat functionality.
- `file-transfer`: The demo that tests on the data transfers functionality.
- `mute-stream`: The demo that tests the muting of stream in a peer-to-peer video call functionality.
- `connection-status`: The demo that tests all the state changes and connectivity status like ICE connection, gathering states, peer connection states etc.
- `datachannel`: The demo that tests on datachannel connectivity.
- `voice-call`: The demo that simulates a voice call connection.