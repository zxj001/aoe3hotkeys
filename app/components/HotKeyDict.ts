export class HotKeyValue {
    name: string;
    event: string;
    action: string;
    constructor(name: string, event: string, action: string) {
        this.name = name;
        this.event = event;
        this.action = action;
    }
}

export class HotKeyDict {
    groups: Map<string, Array<HotKeyValue>>;

    constructor(rawKeyMap) {
        this.groups = new Map();
        if (!rawKeyMap) {
            return;
        }
        let groupList: Array = rawKeyMap[0]["Group"];
        if (!groupList) {
            return;
        }
        groupList.forEach((group) => {
            const groupName = group["$"]["Name"];
            const keyMapList = group["KeyMap"];
            if (!(this.groups.has(groupName))) {
                this.groups.set(groupName, new Array<HotKeyValue>());
            }
            if (!keyMapList) {
                return;
            }
            keyMapList.forEach((keyMap) => {
                const keyName = keyMap["Name"];
                const keyEvent = keyMap["Event"];
                const keyAction = keyMap["Action"];
                this.groups.get(groupName)?.push(new HotKeyValue(keyName, keyEvent, keyAction));
            });
        });

    }
}