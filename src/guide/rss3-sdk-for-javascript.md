# RSS3 SDK for JavaScript

## Introduction

[Source code](https://github.com/NaturalSelectionLabs/RSS3-SDK-for-JavaScript)

This is a RSS3 SDK for JavaScript that is kept up to date with the RSS3 protocol and provides easy access to the main modules of the protocol, as well as the ability to automatically calculate signatures.

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

Then reference `rss3` in your project.

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

If you just want to get the information and don't need to commit it, then the easiest way to initialize it is by creating a temporary account (the first way), i.e. just pass the `endpoint` parameter. Don't worry, no file will actually be changed without calling the `file.sync()` method to commit the file.

If you need to make changes to a file, such as changing the avatar or posting a new item, then for security reasons, unless there is a specific need, you should initialize with external signature method provided by a hot or cold wallet (the second way).

And `agentSign` is a kind of agent signature, refer to the `agent_id` and `agent_signature` fields in [RSS3 protocol](https://github.com/NaturalSelectionLabs/RSS3) for more information. Once the user has initialized the SDK with an external signature, an agent signature is generated to sign subsequent changes. The agent information is stored in a suitable and secure place through the `agentStorage` parameter, the default location is the cookies.

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

Example:

**MetaMask or other ethereum compatible wallet**

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

**Brand new account**

```ts
const rss3 = new RSS3({
    endpoint: 'https://prenode.rss3.dev',
});
```

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

### Getting the avatar of a persona

Use the `rss3.profile.get` method to get the profile of the specified persona, the avatar is in the profile.

If no persona address is specified, the profile of the currently initialized persona will be returned.

Let's get the avatar of a persona `0xC8b960D09C0078c18Dcbe7eB9AB9d816BcCa8944`

```ts
const { avatar } = await rss3.profile.get('0xC8b960D09C0078c18Dcbe7eB9AB9d816BcCa8944');
```

### Adding persona associated accounts

The list of supported accounts is available at [API#Supported account](/guide/api.html#supported-account)

Accounts can be divided into two types: those that are decentralised, including EVM+, and those that belong to centralised platforms, including Twitter Misskey Jike.

Examples of each of these two types are given below.

Let's start by adding current account of MetaMask, please note that this address cannot be duplicated with rss3 instance's main address.

1. Declare this account

```ts
const account = {
    tags: ['test account'], // Optional
    id: RSS3Utils.id.getAccount('EVM+', await signer.getAddress()), // 'EVM+-0xC8b960D09C0078c18Dcbe7eB9AB9d816BcCa8944'
};
```

2. Calculate the message of signature and sign this message using the MetaMask to prove that the account belongs to us.

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

### Getting the list of persona's followers and followings

The protocol defines that each persona can have many types of link, but the protocol does not define what id represent following link. Here we use `following` as the id, you can also define your own link id.

Next let's try to get the persona's following list, that is, the list of link with the id `following`.

```ts
const list = await rss3.links.getList('0xC8b960D09C0078c18Dcbe7eB9AB9d816BcCa8944', 'following');
```

Now we have a array of addresses, but it's very difficult to get their profiles one by one to present a nice list with avatars and names, so SDK provides a way to get profiles in bulk.

```ts
const profiles = await rss3.profile.getList(list);
```

This gives us an array of profiles and addresses, which we can use to render a nice looking list.

The same applies to the list of followers, except that the links are replaced with backlinks.

```ts
const list = await rss3.backlinks.getList('0xC8b960D09C0078c18Dcbe7eB9AB9d816BcCa8944', 'following');
```

Note that there is a high probability that the list of followers will be large, in which case we will need to load it in segments to avoid performance problems.

```ts
const profiles = await rss3.profile.getList(list.slice(0, 10));
```

### Getting assets list

Assets are divided into automatically indexed assets and persona defined assets, here is an example for auto assets.

The list of supported auto assets is available at [API#Supported auto assets](/guide/api.html#supported-auto-assets)

We can get a list of assets of a persona like this

```ts
const assets = (await rss3.assets.auto.getList('0xC8b960D09C0078c18Dcbe7eB9AB9d816BcCa8944')).filter((asset) => !asset.includes('Mirror'));
```

We then find that we only get an array of asset ids and we don't get their details, such as images and names. This is because the details may be slow to returned back, so a better practice is to render the list first, give them a loading state, then request the details and render the images and other information.

```ts
const details = await rss3.assets.getDetails({
    assets,
    full: true,
});
```

Please note that as fetching details from third party sources may be slow, the return value of details may not return all the details of assets requested, nor will it return it in order, so if there are any missing assets then please retry to fetch the missing assets after some time.

We can write a loop to request details.

```ts
let details = [];
for (let i = 0; i < 10; i++) {
    const assetsNoDeails = assets.filter((asset) => !details.find((detail) => detail.id === asset));
    if (!assetsNoDeails.length) {
        break;
    }
    details = details.concat(await rss3_new.assets.getDetails({
        assets: assetsNoDeails,
        full: true,
    }));
    myRender(details);
}
```

### Getting the items stream

### Postting an custom item

TODO

### Reply or like other items

TODO

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