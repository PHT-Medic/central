import {Ability} from "@casl/ability";

const ability = new Ability();

export default function ({store}, inject) {
    ability.update(store.state.auth.abilities);

    return store.subscribe((mutation, state) => {
        switch(mutation.type) {
            case 'auth/setAbilities':
                ability.update(store.state.auth.abilities);
                //inject('ability',ability);
                break;
            case 'auth/unsetAbilities':
                ability.update(store.state.auth.abilities);
                break;
        }
    });
}

export {
    ability
}
