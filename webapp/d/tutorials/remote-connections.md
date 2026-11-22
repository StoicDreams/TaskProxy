<webui-data data-page-title="Use Task Proxy from Another Computer" data-page-subtitle="Tutorial: about 5 minutes" data-page-description="Turn on Remote Connections, then open your computer's Task Proxy in a browser anywhere, approved once and limited to what you allow."></webui-data>

## What Remote Connections does

<webui-page-segment elevation="10">

**Remote Connections** lets you use Task Proxy on your computer from a browser somewhere else, such as a laptop or phone, at [www.taskproxy.com/remote/](/remote/). The browser shows your computer's own Task Proxy, running your computer's projects and scripts, so you can check on a build or a test run while you are away from your desk.

The browser connects straight to your computer. Your projects, files, and secrets stay on it.

You'll need a Stoic Dreams account, signed in to in both places.

</webui-page-segment>

## 1. Sign in on your computer

<webui-page-segment elevation="10">

In Task Proxy, open **Tools**, the toolbox at the top right, and choose its **Account** tab. Click **Sign In**. Your browser opens StoicDreams.com: sign in there if it asks, and approve the sign-in when it shows the same code as Task Proxy.

Task Proxy keeps the sign-in in your system's keychain, so you only do this once.

<webui-loop-video src="/video/loops/account.mp4" poster="/video/loops/account.webp" alt="The Account tab of Tools, signing in to a Stoic Dreams account with a code shown in both places"></webui-loop-video>

</webui-page-segment>

## 2. Turn on Remote Connections

<webui-page-segment elevation="10">

1. Open **Settings** from the Task Proxy logo at the top left, and choose the **Remote Connections** tab.
2. Give this computer a name you'll recognize, such as "Work desktop", and click **Turn On**.
3. Choose whether to **Keep this computer awake**, so your browsers can reach it, or **Let this computer sleep as usual**. Its screen can still turn off.

<webui-loop-video src="/video/loops/remote-connections.mp4" poster="/video/loops/remote-connections.webp" alt="Settings' Remote Connections tab, turned on, with this computer's name and an approved browser"></webui-loop-video>

</webui-page-segment>

## 3. Connect from a browser

<webui-page-segment elevation="10">

1. On the other device, open [www.taskproxy.com/remote/](/remote/) and sign in with the same account.
2. **Your Computers** lists each computer with Remote Connections on. Click **Connect** on yours.
3. The first time, the browser shows a code and waits. On your computer, the browser shows under **Waiting for Approval**. Check its code matches the one on the browser, choose what it may do, and click **Approve**. If you don't recognize it, click **Refuse**.

From then on, that browser connects straight away. Reloading the page connects again, and **Disconnect** closes the connection.

<webui-quote theme="warning">

Approve a browser only when its code matches the one it shows. A refused browser can't ask again until you choose **Allow to Ask Again**.

</webui-quote>

</webui-page-segment>

## 4. Choose what each browser may do

<webui-page-segment elevation="10">

Each approved browser has its own level, which you can change at any time under **Approved Browsers**:

| Level | It may |
|---|---|
| **View** | Look at projects, changes, and runs |
| **Commit** | Also commit, pull, push, and change branches |
| **Work** | Also edit, set variables, and run trusted scripts |

**Remove Browser** takes its approval away and disconnects it. **Show Activity** lists what each browser did, without what it sent.

A browser opens the app on a page of its own, so it never moves what you see on the computer. Turning Remote Connections on or off, and changing what a browser may do, can only be done on the computer itself.

</webui-page-segment>

## If it won't connect

<webui-page-segment elevation="10">

- **None of your computers show:** check Task Proxy is open on the computer, signed in to the same account, with Remote Connections on.
- **The computer answered, but no connection could be made:** some networks don't allow a direct connection. Try from the same Wi-Fi, or over a VPN.
- **Different versions:** update Task Proxy on the computer, or reload the page.
- **Signing in doesn't stick:** your browser may be blocking the sign-in cookie. Allow cookies for the site, then sign in again.

</webui-page-segment>

<webui-flex justify="flex-end">
    <webui-button href="/tutorials" theme="primary" end-icon="graduation-cap">Back to All Tutorials</webui-button>
</webui-flex>
