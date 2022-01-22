# RSS3 SDK for JavaScript

## Introduction

[Source code](https://github.com/NaturalSelectionLabs/RSS3-SDK-for-JavaScript)

This is an RSS3 SDK for JavaScript that is kept up-to-date with the RSS3 protocol and provides easy access to the main modules, as well as automatic signature handlings.

The SDK is compatible with Node.js environments and major modern browsers, and has good support for TypeScript.

[![test](https://github.com/NaturalSelectionLabs/RSS3-SDK-for-JavaScript/actions/workflows/test.yml/badge.svg)](https://github.com/NaturalSelectionLabs/RSS3-SDK-for-JavaScript/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/NaturalSelectionLabs/RSS3-SDK-for-JavaScript/branch/develop/graph/badge.svg?token=361AKFS8AH)](https://codecov.io/gh/NaturalSelectionLabs/RSS3-SDK-for-JavaScript)

## Install

&nbsp;

Installing `rss3` via yarn or npm.

<code-group>
<code-block title="yarn" active>
```bash
yarn add rss3
```
</code-block>

<code-block title="npm">
```bash
npm install rss3 --save
```
</code-block>
</code-group>

Then reference `rss3` in our project.

```js
import RSS3, { utils as RSS3Utils } from 'rss3';
```

## Getting Started

The first step in using the sdk is to initialise it.

### Initialization

There are 4 ways to initialize the SDK:

-   Create a temporary account (recommended where file modification is not required)
-   Initialize with external signature method (recommended where file modification may be required)
-   Initialize with mnemonic
-   Initialize with private key

```ts
interface IOptions {
    endpoint: string; // The RSS3 network endpoint
    agentSign?: boolean;
    agentStorage?: {
        set: (key: string, value: string) => Promise<void>;
        get: (key: string) => Promise<string>;
    };
}

export interface IOptionsMnemonic extends IOptions {
    mnemonic?: string;
    mnemonicPath?: string;
}

export interface IOptionsPrivateKey extends IOptions {
    privateKey: string;
}

export interface IOptionsSign extends IOptions {
    address: string;
    sign: (data: string) => Promise<string>;
}

new RSS3(options: IOptionsMnemonic | IOptionsPrivateKey | IOptionsSign);
```

**Temporary account**

If the app only needs get information (e.g. activity feed or assets) from the RSS3 network without committing changes, the easiest way to initialize it is by creating a temporary account (the first way), i.e. just pass the `endpoint` parameter.

```ts
const rss3 = new RSS3({
    endpoint: 'https://prenode.rss3.dev',
});
```

**MetaMask or other ethereum compatible wallet**

If the app wants to help users make changes to a file (e.g. posting a new item or adding a new link), then, for security reasons, unless there is a specific need, we should initialize with external signature method provided by a hot or cold wallet (the second way).

<code-group>
<code-block title="ethers" active>
```ts
import RSS3 from 'rss3';
import { ethers } from 'ethers';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const rss3 = new RSS3({
    endpoint: 'https://prenode.rss3.dev',
    address: await signer.getAddress(),
    sign: async (data) => await signer.signMessage(data),
});
```
</code-block>

<code-block title="web3.js">
```ts
import RSS3 from 'rss3';
import Web3 from 'web3';

const web3 = new Web3(window.ethereum);
const address = (await web3.eth.getAccounts())[0];
const rss3 = new RSS3({
    endpoint: 'https://prenode.rss3.dev',
    address,
    sign: async (data) => await web3.eth.personal.sign(data, address),
});
```
</code-block>
</code-group>

And `agentSign` is a type of agent signature - refer to the `agent_id` and `agent_signature` fields in [RSS3 protocol](https://github.com/NaturalSelectionLabs/RSS3) for more information. Once the user has initialized the SDK with an external signature, an agent signature is generated to sign subsequent changes. The agent information is stored in a suitable and secure place through the `agentStorage` parameter, and the default location is the cookies.

We can also initialize the SDK with mnemonic or private keys, though not highly recommended.

**Mnemonic**

```ts
const rss3 = new RSS3({
    endpoint: 'https://prenode.rss3.dev',
    mnemonic: 'xxx',
    mnemonicPath: 'xxx',
});
```

**PrivateKey**

```ts
const rss3 = new RSS3({
    endpoint: 'https://prenode.rss3.dev',
    privateKey: '0xxxx',
});
```

The next section describes the use of the SDK through several usage scenarios.

### Getting Profile Details

While external DID projects are supported (e.g. ENS, next.id and self.id), you can also get profile details from the RSS3 Network including avatars and nicknames. 

Use the `rss3.profile.get` method to get the profile of the specified persona.

If no persona address is specified, the profile of the currently initialized persona will be returned.

Let's get the account details of a persona `0xC8b960D09C0078c18Dcbe7eB9AB9d816BcCa8944`

```ts
const { details } = await rss3.profile.get('0xC8b960D09C0078c18Dcbe7eB9AB9d816BcCa8944');
```

### Adding Persona's Associated Accounts

You can also help users add accounts to the RSS3 Network. 

The list of supported accounts is available at [API#Supported account](/guide/api.html#supported-account)

Accounts can be divided into two types: those that are decentralised, say blockchains, and those that belong to centralised platforms, including Twitter, Misskey and Jike.

Examples of each of these two types are given below.

Let's start by adding the current account of MetaMask. Please note that this address cannot be duplicated with rss3 instance's main address.

1. Declare this account

```ts
const account = {
    tags: ['test account'], // Optional
    id: RSS3Utils.id.getAccount('EVM+', await signer.getAddress()), // 'EVM+-0xC8b960D09C0078c18Dcbe7eB9AB9d816BcCa8944'
};
```

2. Compute the signature message and sign this message using the MetaMask to prove that the account belongs to us.

```ts
const signMessage = await rss3.profile.accounts.getSigMessage(account);
account.signature = await signer.signMessage(signMessage);
```

3. Add account to rss3 file

```ts
await rss3.profile.accounts.post(account);
```

4. Sync the modified file to RSS3 network

```ts
await rss3.files.sync();
```

Next let's add another account on a centralised platform, such as Twitter.

1. Add our main address or a name pointing to our main address (see [API#Supported name service](/guide/api.html#supported-name-service)) to the Twitter bio, name or url

2. Declare this account; 3. Add account to rss3 file; 4. Sync the modified file to RSS3 network (Same as above)

```ts
const account = {
    id: RSS3Utils.id.getAccount('Twitter', 'DIYgod'), // 'Twitter-DIYgod'
};
await rss3.profile.accounts.post(account);
await rss3.files.sync();
```

### Getting the List of Persona's Links

RSS3 works with all social graph projects, however, if you want to leverage existing links on the RSS3 Network, here is how to make it work. 

The protocol defines that each persona can have many types of link, we will take `following` as an example. Here we use `following` as the id. We can also define our own link id.

Next let's try to get the persona's following list, that is, the list of link with the id `following`.

```ts
const list = await rss3.links.getList('0xC8b960D09C0078c18Dcbe7eB9AB9d816BcCa8944', 'following');
```

Now we have a array of addresses, but it's very difficult to get their profiles one by one to present a nice list with avatars and names, so the SDK provides a way to get profiles in bulk.

```ts
const profiles = await rss3.profile.getList(list);
```

This gives us an array of profiles and addresses, which we can use to render a nice looking list.

The same applies to the list of followers, except that the links are replaced with backlinks.

```ts
const list = await rss3.backlinks.getList('0xC8b960D09C0078c18Dcbe7eB9AB9d816BcCa8944', 'following');
```

Note that there is a high probability that the list of followers will be large, in which case we will need to load it in segments to avoid performance issues.

```ts
const page1 = await rss3.profile.getList(list.slice(0, 10));
```

When the user scrolls to the next section

```ts
const page2 = await rss3.profile.getList(list.slice(10, 20));
```

### Getting Asset List

Assets are divided into automatically indexed assets and self-declared assets (WIP), here is an example for auto assets.

The list of supported auto assets is available at [API#Supported auto assets](/guide/api.html#supported-auto-assets)

We can get a list of assets of a persona like this

```ts
const assets = (await rss3.assets.auto.getList('0xC8b960D09C0078c18Dcbe7eB9AB9d816BcCa8944')).filter((asset) => !asset.includes('Mirror'));
```

We will then find that we only get an array of asset ids without details, such as images or names. This is because details of some assets may a little longer for indexing. So a better practice is to render the list first, give them a loading state, then request the details and render the images and other information afterwards. 

```ts
const details = await rss3.assets.getDetails({
    assets,
    full: true,
});
```

Please note that as fetching details from third party sources may be slow, the return value of details may not return all the details of assets requested, nor will it return it in order. So if there are any missing assets, retry to fetch the missing assets after some time.

We can write a loop to request details.

```ts
let details = [];
for (let i = 0; i < 10; i++) {
    const assetsNoDeails = assets.filter((asset) => !details.find((detail) => detail.id === asset));
    if (!assetsNoDeails.length) {
        break;
    }
    details = details.concat(await rss3.assets.getDetails({
        assets: assetsNoDeails,
        full: true,
    }));
    myRender(details);
}
```

### Getting Activity Feeds

Items in the activity feed are divided into auto items indexed by the node and items submitted by the persona with signature. Therefore, items are stored in two types of files, and since auto indexed items may not be sorted chronologically, it is difficult for the client to accurately compute a chronological list. So the Node and SDK provide a more convenient way of getting items in chronological order.

If we want to get the last 10 activity items for a specific persona `0xC8b960D09C0078c18Dcbe7eB9AB9d816BcCa8944`:

```ts
const page1 = await rss3.items.getListByPersona({
    limit: 10,
    persona: '0xC8b960D09C0078c18Dcbe7eB9AB9d816BcCa8944',  
});
```

If we want to leverage existing links (e.g. following) in the RSS3 networks for a list of items from other personas followed by `0xC8b960D09C0078c18Dcbe7eB9AB9d816BcCa8944`:

```ts
const page1 = await rss3.items.getListByPersona({
    limit: 10,
    persona: '0xC8b960D09C0078c18Dcbe7eB9AB9d816BcCa8944',
    linkID: 'following',
});
```

If we use an external social graph (e.g. CyberConnect or Mem) and already have a list of following addresses:

```ts
const page1 = await rss3.items.getListByPersona({
    limit: 10,
    personaList: list,
});
```

If we only want to get specific type(s) of activities, then:

```ts
const page1 = await rss3.items.getListByPersona({
    limit: 10,
    persona: '0xC8b960D09C0078c18Dcbe7eB9AB9d816BcCa8944',
    linkID: 'following',
    fieldLike: 'NFT',
});
```

Possible values for field is available at [API#Supported auto items](/guide/api.html#supported-auto-items).

Some of these items are changes to assets, such as getting an NFT, we may also need their details to render the image and name of the assets, which again uses the `rss3.assets.getDetails` method mentioned above.

```ts
const assets = page1.filter((item) => item?.target?.field?.startsWith('assets-')).map((item) => item.target.field.replace(/^assets-/, ''));

// Same as above
let details = [];
for (let i = 0; i < 10; i++) {
    const assetsNoDeails = assets.filter((asset) => !details.find((detail) => detail.id === asset));
    if (!assetsNoDeails.length) {
        break;
    }
    details = details.concat(await rss3.assets.getDetails({
        assets: assetsNoDeails,
        full: true,
    }));
    myRender(details);
}
```

Also, if we want to get the profile from the RSS3 Network, e.g. nickname and avatar, of a list of personas from the item list, we can:

```ts
const profileSet = page1.filter((item) => item?.target?.field?.startsWith('assets-')).map((item) => utils.id.parse(item.id).persona);
let profiles = await rss3.profile.getList(profileSet);
```

When the user scrolls to the next section, we use the time of the last item on the page1 as a tsp parameter to get the next 10 items.

```ts
const page2 = await rss3.items.getListByPersona({
    limit: 10,
    persona: '0xC8b960D09C0078c18Dcbe7eB9AB9d816BcCa8944',
    linkID: 'following',
    fieldLike: 'NFT',
    tsp: page1[page1.length - 1].date_created,
});
```

### Posting Custom Items

Let's start with a plain text item

```ts
await rss3.items.custom.post({
    summary: 'I love RSS3',
});
```

Sometimes we also want to attach an image or a video to items, we need to upload the resource to an external storage to get an address, then put it in the content.

```ts
await rss3.items.custom.post({
    summary: 'I love RSS3',
    contents: [{
        type: 'image/jpeg',
        address: 'https://picsum.photos/200/300',
    }, {
        type: 'video/mp4',
        address: 'https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_480_1_5MG.mp4',
    }],
});
```

Sometimes we want to post an item that is related to another item, such as commenting on or liking an item.

```ts
// comment
await rss3.items.custom.post({
    summary: 'I love you',
    link: {
        id: 'comment',
        target: '0xC8b960D09C0078c18Dcbe7eB9AB9d816BcCa8944-item-auto-1',
    };
});

// like
const likeItem = await rss3.items.custom.post({
    link: {
        id: 'like',
        target: '0xC8b960D09C0078c18Dcbe7eB9AB9d816BcCa8944-item-auto-1',
    };
});
```

Then if we want to modify the item, for example, by unliking it or modifying the summary, just tell the sdk the id of the item you want to modify and the content of the modified item.

```ts
await rss3.items.custom.patch({
    id: likeItem.id,
    summary: 'New summary',
});
```

Finally don't forget to sync your files.

```ts
await rss3.files.sync();
```

## SDK API

View our full SDK API here

### Files

**files.sync()**

Please note that changes will only be synced to the node after `files.sync()` has been successfully executed

<code-group>
<code-block title="types" active>
```ts
files.sync(): string[]
```
</code-block>

<code-block title="example">
```ts
const changedFiles = rss3.files.sync();
```
</code-block>
</code-group>

**files.get()**

<code-group>
<code-block title="types" active>
```ts
files.get(fileID: string): Promise<RSS3Content>
```
</code-block>

<code-block title="example">
```ts
const file = await rss3.files.get(rss3.account.address);
```
</code-block>
</code-group>

### Account

**account.mnemonic**

If initialized with privateKey or a custom sign function, then this value is undefined

```ts
account.mnemonic: string | undefined
```

**account.privateKey**

If initialized with a custom sign function, then this value is undefined

```ts
account.privateKey: string | undefined
```

**account.address**

```ts
account.address: string
```

### Profile

**profile.get()**

<code-group>
<code-block title="types" active>
```ts
profile.get(personaID: string = account.address): Promise<RSS3Profile>
```
</code-block>

<code-block title="example">
```ts
const file = await rss3.files.get(rss3.account.address);
```
</code-block>
</code-group>

**profile.patch()**

<code-group>
<code-block title="types" active>
```ts
profile.patch(profile: RSS3Profile): Promise<RSS3Profile>
```
</code-block>

<code-block title="example">
```ts
const newProfile = await rss3.profile.patch({
    name: 'RSS3',
    avatar: 'https://cloudflare-ipfs.com/ipfs/QmZWWSspbyFtWpLZtoAK35AjEYK75woNawqLgKC4DRpqxu',
    bio: 'RSS3 is an open protocol designed for content and social networks in the Web 3.0 era.',
});
```
</code-block>
</code-group>

**profile.getList()**

<code-group>
<code-block title="types" active>
```ts
profile.get(personas: string[]): Promise<(RSS3Profile & { persona: string })[]>
```
</code-block>

<code-block title="example">
```ts
const profiles = rss3.profile.getList([
    '0xC8b960D09C0078c18Dcbe7eB9AB9d816BcCa8944',
    '0xee8fEeb6D0c2fC02Ef41879514A75d0E791b5061',
]);
```
</code-block>
</code-group>

### Profile.accounts

**profile.accounts.getSigMessage()**

<code-group>
<code-block title="types" active>
```ts
profile.accounts.getSigMessage(account: RSS3Account): Promise<string>
```
</code-block>

<code-block title="example">
```ts
const sigMessage = await rss3.profile.accounts.getSigMessage({
    id: RSS3Utils.id.getAccount('EVM+', '0x1234567890123456789012345678901234567890'),
    tags: ['test'],
});
```
</code-block>
</code-group>

**profile.accounts.getList()**

<code-group>
<code-block title="types" active>
```ts
profile.accounts.getList(persona?: string): Promise<RSS3Account[]>
```
</code-block>

<code-block title="example">
```ts
const list = await rss3.profile.accounts.getList('0x1234567890123456789012345678901234567890');
```
</code-block>
</code-group>

**profile.accounts.post()**

<code-group>
<code-block title="types" active>
```ts
profile.accounts.post(account: RSS3Account): Promise<RSS3Account>
```
</code-block>

<code-block title="example">
```ts
const account = {
    id: RSS3Utils.id.getAccount('EVM+', '0x1234567890123456789012345678901234567890'),
    tags: ['test'],
};
const signature = mySignFun(await rss3.profile.accounts.getSigMessage(account));
account.signature = signature;
const account = await rss3.profile.accounts.post(account);
```
</code-block>
</code-group>

**profile.accounts.delete()**

<code-group>
<code-block title="types" active>
```ts
profile.accounts.delete(id: string): Promise<string>
```
</code-block>

<code-block title="example">
```ts
const account = await rss3.profile.accounts.delete(
    RSS3Utils.id.getAccount('EVM+', '0x1234567890123456789012345678901234567890'),
);
```
</code-block>
</code-group>

### Items

**items.getListByPersona()**

<code-group>
<code-block title="types" active>
```ts
items.getListByPersona(options: {
    limit: number;
    tsp: string;
    persona: string;
    linkID?: string;
    fieldLike?: string;
}): Promise<(RSS3CustomItem | RSS3AutoItem)[]>
```
</code-block>

<code-block title="example">
```ts
const followingTimeline = await rss3.items.getListByPersona({
    persona: '0x1234567890123456789012345678901234567890',
    linkID: 'following',
    limit: 10,
    tsp: '2021-12-06T13:59:57.030Z',
});
const personaTimeline = await rss3.items.getListByPersona({
    persona: '0x1234567890123456789012345678901234567890',
    limit: 10,
    tsp: '2021-12-06T13:59:57.030Z',
});
```
</code-block>
</code-group>

### Items.auto

**items.auto.getListFile()**

<code-group>
<code-block title="types" active>
```ts
items.auto.getListFile(persona: string, index?: number): Promise<RSS3AutoItemsList | null>
```
</code-block>

<code-block title="example">
```ts
const items = await rss3.items.auto.getListFile(rss3.account.address, -1);
```
</code-block>
</code-group>

**items.auto.getList()**

<code-group>
<code-block title="types" active>
```ts
items.auto.getList(persona: string, breakpoint?: (file: RSS3AutoItemsList) => boolean): Promise<RSS3AutoItem[]>
```
</code-block>

<code-block title="example">
```ts
const autoItems = await rss3.auto.items.getList('0x1234567890123456789012345678901234567890');
```
</code-block>
</code-group>

**items.auto.backlinks.getListFile()**

<code-group>
<code-block title="types" active>
```ts
items.auto.getListFile(persona: string, index?: number): Promise<RSS3AutoItemsList | null>
```
</code-block>

<code-block title="example">
```ts
const backlinks = await rss3.items.auto.getListFile('0x1234567890123456789012345678901234567890', -1);
```
</code-block>
</code-group>

**items.auto.backlinks.getList()**

<code-group>
<code-block title="types" active>
```ts
items.auto.backlinks.getList(persona: string, breakpoint?: ((file: RSS3AutoItemsList) => boolean) | undefined): Promise<RSS3AutoItem[]>
```
</code-block>

<code-block title="example">
```ts
const backlinks = await rss3.items.auto.backlinks.getList('0x1234567890123456789012345678901234567890');
```
</code-block>
</code-group>

### Items.custom

**items.custom.getListFile()**

<code-group>
<code-block title="types" active>
```ts
items.custom.getListFile(persona: string, index?: number): Promise<RSS3CustomItemsList | null>
```
</code-block>

<code-block title="example">
```ts
const items = await rss3.items.custom.getListFile(rss3.account.address, -1);
```
</code-block>
</code-group>

**items.custom.getList()**

<code-group>
<code-block title="types" active>
```ts
items.custom.getList(persona: string, breakpoint?: (file: RSS3AutoItemsList) => boolean): Promise<RSS3AutoItem[]>
```
</code-block>

<code-block title="example">
```ts
const customItems = await rss3.items.custom.getList('0x1234567890123456789012345678901234567890');
```
</code-block>
</code-group>

**item.custom.post()**

<code-group>
<code-block title="types" active>
```ts
item.custom.post(itemIn: Omit<RSS3CustomItem, 'id' | 'date_created' | 'date_updated'>): Promise<RSS3CustomItem>
```
</code-block>

<code-block title="example">
```ts
const item = await rss3.item.custom.post({
    title: 'Hello RSS3',
    summary: 'RSS3 is an open protocol designed for content and social networks in the Web 3.0 era.',
});
```
</code-block>
</code-group>

**item.custom.patch**

<code-group>
<code-block title="types" active>
```ts
item.custom.patch(item: Partial<RSS3CustomItem> & {
    id: RSS3CustomItemID;
}): Promise<RSS3CustomItem | null>
```
</code-block>

<code-block title="example">
```ts
const newItem = await rss3.item.custom.patch({
    id: '0x1234567890123456789012345678901234567890-item-custom-0',
    title: 'Hi RSS3',
});
```
</code-block>
</code-group>

**items.custom.backlinks.getListFile()**

<code-group>
<code-block title="types" active>
```ts
items.custom.getListFile(persona: string, index?: number): Promise<RSS3CustomItemsList | null>
```
</code-block>

<code-block title="example">
```ts
const backlinks = await rss3.items.custom.getListFile('0x1234567890123456789012345678901234567890', -1);
```
</code-block>
</code-group>

**items.custom.backlinks.getList()**

<code-group>
<code-block title="types" active>
```ts
items.custom.backlinks.getList(persona: string, breakpoint?: ((file: RSS3CustomItemsList) => boolean) | undefined): Promise<RSS3CustomItem[]>
```
</code-block>

<code-block title="example">
```ts
const backlinks = await rss3.items.custom.backlinks.getList('0x1234567890123456789012345678901234567890');
```
</code-block>
</code-group>

### Links

**links.getListFile()**

<code-group>
<code-block title="types" active>
```ts
links.getListFile(persona: string, id: string, index?: number): Promise<RSS3LinksList | null>
```
</code-block>

<code-block title="example">
```ts
const followers = await rss3.links.getListFile(rss3.account.address, 'following', -1);
```
</code-block>
</code-group>

**links.getList()**

<code-group>
<code-block title="types" active>
```ts
links.getList(persona: string, id: string, breakpoint?: ((file: RSS3LinksList) => boolean) | undefined): Promise<string[]>
```
</code-block>

<code-block title="example">
```ts
const following = await rss3.links.getList(rss3.account.address, 'following');
```
</code-block>
</code-group>

**links.postList()**

<code-group>
<code-block title="types" active>
```ts
links.postList(links: {
    tags?: string[];
    id: string;
    list?: RSS3ID[];
}): Promise<{
    tags?: string[];
    id: string;
    list?: RSS3ID[];
}>
```
</code-block>

<code-block title="example">
```ts
const following = await rss3.links.postList({
    id: 'following',
    list: ['0xd0B85A7bB6B602f63B020256654cBE73A753DFC4'],
});
```
</code-block>
</code-group>

**links.deleteList()**

<code-group>
<code-block title="types" active>
```ts
links.deleteList(id: string): Promise<{
    tags?: string[] | undefined;
    id: string;
    list?: string | undefined;
} | undefined>
```
</code-block>

<code-block title="example">
```ts
const following = await rss3.links.deleteList('following');
```
</code-block>
</code-group>

**links.patchListTags()**

<code-group>
<code-block title="types" active>
```ts
links.patchListTags(id: string, tags: string[]): Promise<{
    tags?: string[] | undefined;
    id: string;
    list?: string | undefined;
}>
```
</code-block>

<code-block title="example">
```ts
const following = await rss3.links.patchListTags('following', ['test']);
```
</code-block>
</code-group>

**links.post()**

<code-group>
<code-block title="types" active>
```ts
links.post(id: string, personaID: string): Promise<RSS3LinksList | undefined>
```
</code-block>

<code-block title="example">
```ts
const following = await rss3.links.post('following', '0xd0B85A7bB6B602f63B020256654cBE73A753DFC4');
```
</code-block>
</code-group>

**links.delete()**

<code-group>
<code-block title="types" active>
```ts
links.delete(id: string, personaID: string): Promise<string[] | null>
```
</code-block>

<code-block title="example">
```ts
const following = await rss3.links.delete('following', '0xd0B85A7bB6B602f63B020256654cBE73A753DFC4');
```
</code-block>
</code-group>

### Backlinks

**backlinks.getListFile()**

<code-group>
<code-block title="types" active>
```ts
backlinks.getListFile(persona: string, id: string, index?: number): Promise<RSS3BacklinksList | null>
```
</code-block>

<code-block title="example">
```ts
const followers = await rss3.backlinks.getListFile(rss3.account.address, 'following', -1);
```
</code-block>
</code-group>

**backlinks.getList()**

<code-group>
<code-block title="types" active>
```ts
backlinks.getList(persona: string, id: string, breakpoint?: ((file: RSS3BacklinksList) => boolean) | undefined): Promise<string[]>
```
</code-block>

<code-block title="example">
```ts
const followers = await rss3.backlinks.getList(rss3.account.address, 'following');
```
</code-block>
</code-group>

### Assets

**assets.getDetails()**

<code-group>
<code-block title="types" active>
```ts
assets.getDetails(options: {
    assets: string[];
    full?: boolean;
}): Promise<AnyObject[]>
```
</code-block>

<code-block title="example">
```ts
const details = await rss3.assets.getDetails({
    assets: ['xxx', 'xxx'],
    full: true,
});
```
</code-block>
</code-group>

### Assets.auto

**assets.auto.getListFile()**

<code-group>
<code-block title="types" active>
```ts
assets.auto.getListFile(persona: string, index?: number): Promise<RSS3AutoAssetsList | null>
```
</code-block>

<code-block title="example">
```ts
const assets = await rss3.assets.auto.getListFile(rss3.account.address, -1);
```
</code-block>
</code-group>

**assets.auto.getList()**

<code-group>
<code-block title="types" active>
```ts
assets.auto.getList(persona: string, breakpoint?: (file: RSS3AutoAssetsList) => boolean): Promise<RSS3AutoAsset[]>
```
</code-block>

<code-block title="example">
```ts
const autoAssets = await rss3.auto.assets.getList('0x1234567890123456789012345678901234567890');
```
</code-block>
</code-group>

### Assets.custom

**assets.custom.getListFile()**

<code-group>
<code-block title="types" active>
```ts
assets.custom.getListFile(persona: string, index?: number): Promise<RSS3AutoAssetsList | null>
```
</code-block>

<code-block title="example">
```ts
const assets = await rss3.assets.custom.getListFile(rss3.account.address, -1);
```
</code-block>
</code-group>

**assets.custom.getList()**

<code-group>
<code-block title="types" active>
```ts
assets.custom.getList(persona: string, breakpoint?: (file: RSS3CustomAssetsList) => boolean): Promise<RSS3CustomAsset[]>
```
</code-block>

<code-block title="example">
```ts
const customAssets = await rss3.custom.assets.getList('0x1234567890123456789012345678901234567890');
```
</code-block>
</code-group>

**asset.custom.post()**

<code-group>
<code-block title="types" active>
```ts
asset.custom.post(asset: RSS3CustomAsset): Promise<RSS3CustomAsset>
```
</code-block>

<code-block title="example">
```ts
const asset = await rss3.custom.asset.post('custom-gk-q-10035911');
```
</code-block>
</code-group>

**asset.custom.delete**

<code-group>
<code-block title="types" active>
```ts
asset.custom.delete(asset: RSS3CustomAsset): Promise<RSS3CustomAsset[] | undefined>
```
</code-block>

<code-block title="example">
```ts
const otherAsset = await rss3.asset.custom.delete('custom-gk-q-10035911');
```
</code-block>
</code-group>

## Development

```bash
yarn
yarn dev
```

Open http://localhost:8080/demo/

Test

```bash
yarn test
```