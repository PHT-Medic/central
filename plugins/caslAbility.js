import {Ability} from "@casl/ability";

const ability = new Ability();

export default function ({store, app}, inject) {
    ability.update(store.state.auth.abilities);

    return store.subscribe((mutation, state) => {
        switch(mutation.type) {
            case 'auth/setAbilities':
                ability.update(store.state.auth.abilities);
                app.ability = ability; // todo: test

                //inject('ability',ability);
                break;
            case 'auth/unsetAbilities':
                console.log('Unset abilities');
                ability.update(store.state.auth.abilities);
                app.ability = ability;
                break;
        }
    });
}

export {
    ability
}
