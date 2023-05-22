/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImage, MasterImageGroup } from '@personalhealthtrain/central-common';
import type { FormSelectOption } from '@vue-layout/form-controls';
import { buildFormSelect } from '@vue-layout/form-controls';
import type { ListItemsSlotProps } from '@vue-layout/list-controls';
import { SlotName } from '@vue-layout/list-controls';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import type { VNodeArrayChildren } from 'vue';
import { defineComponent } from 'vue';
import { buildValidationTranslator } from '../../../composables/ilingo';
import { wrapFnWithBusyState } from '../../../core/busy';
import MasterImageGroupList from '../master-image-group/MasterImageGroupList';
import MasterImageList from './MasterImageList';

export default defineComponent({
    name: 'MasterImagePicker',
    components: { MasterImageList },
    props: {
        entityId: {
            type: String,
            default: undefined,
        },
    },
    emits: ['selected'],
    async setup(props, { emit }) {
        const refs = toRefs(props);

        const busy = ref(false);
        const form = reactive({
            group_virtual_path: '',
            master_image_id: '',
        });

        const $v = useVuelidate({
            group_virtual_path: {
                required,
            },
            master_image_id: {
                required,
            },
        }, form);

        const masterImageEntity = ref<MasterImage | null>(null);
        const masterImageGroupEntity = ref<MasterImageGroup | null>(null);

        const isVirtualGroupPathDefined = computed(() => !!form.group_virtual_path &&
                form.group_virtual_path.length > 0);

        const imageQuery = computed(() => ({
            filters: {
                ...(form.group_virtual_path !== '' ? {
                    group_virtual_path: form.group_virtual_path,
                } : {}),
            },
        }));

        const loadImage = wrapFnWithBusyState(busy, async () => {
            if (!form.master_image_id) return;

            if (
                masterImageEntity.value &&
                masterImageEntity.value.id === form.master_image_id
            ) {
                form.group_virtual_path = masterImageEntity.value.group_virtual_path;
                return;
            }

            try {
                masterImageEntity.value = await useAPI().masterImage.getOne(form.master_image_id);
                form.group_virtual_path = masterImageEntity.value.group_virtual_path;

                if (!masterImageGroupEntity.value || form.group_virtual_path !== masterImageGroupEntity.value.virtual_path) {
                    const { data } = await useAPI().masterImageGroup.getMany({
                        filters: {
                            virtual_path: form.group_virtual_path,
                        },
                    });

                    const entity = data.pop();

                    if (entity) {
                        masterImageGroupEntity.value = entity;
                    }
                }
            } catch (e) {
                // ...
            }
        });

        const init = () => {
            if (!refs.entityId.value) return;

            form.master_image_id = refs.entityId.value;
        };

        watch(refs.entityId, (val, oldValue) => {
            if (val && val !== oldValue) {
                init();
                loadImage();
            }
        });

        init();
        await loadImage();

        const itemListNode = ref<null | Record<string, any>>(null);

        const selectGroup = (group: MasterImageGroup | null) => {
            if (!group) {
                form.group_virtual_path = '';
                masterImageGroupEntity.value = null;
                emit('selected', null); // todo: check
                return;
            }

            const changed = group.virtual_path !== form.group_virtual_path;

            form.group_virtual_path = group.virtual_path;
            masterImageGroupEntity.value = group;

            if (changed && itemListNode.value) {
                itemListNode.value.load();
            }
        };

        const selectImage = (entity: MasterImage | null) => {
            if (entity) {
                if (masterImageGroupEntity.value) {
                    entity.command = entity.command || masterImageGroupEntity.value.command;
                    entity.command_arguments = entity.command_arguments || masterImageGroupEntity.value.command_arguments;
                }

                emit('selected', entity);
                return;
            }

            emit('selected', null);
        };

        const buildMasterImageVNode = () : VNodeArrayChildren => {
            if (!isVirtualGroupPathDefined.value) {
                return [];
            }

            return [
                h('div', {
                    class: 'col',
                }, [
                    h(MasterImageList, {
                        ref: itemListNode,
                        headerSearch: false,
                        headerTitle: false,
                        footerPagination: false,
                        query: imageQuery.value,
                    }, {
                        [SlotName.ITEMS]: (props: ListItemsSlotProps<MasterImage>) => {
                            const options: FormSelectOption[] = props.data.map((entity) => ({
                                id: entity.id,
                                value: entity.name,
                            }));

                            return buildFormSelect({
                                validationTranslator: buildValidationTranslator(),
                                validationResult: $v.value.master_image_id,
                                label: true,
                                labelContent: [
                                    'Image',
                                    form.master_image_id ?
                                        h('i', { class: 'fa fa-check text-success ml-1' }) :
                                        h(''),
                                ],
                                value: form.master_image_id,
                                onChange(input) {
                                    const index = props.data.findIndex((el) => el.id === input);
                                    if (index !== -1) {
                                        selectImage(props.data[index]);
                                        return;
                                    }

                                    selectImage(null);
                                },
                                options,
                            });
                        },
                    }),
                ]),
            ];
        };

        return () => h(
            'div',
            { class: 'row' },
            [
                h(
                    'div',
                    { class: 'col' },
                    [
                        h(MasterImageGroupList, {
                            [SlotName.ITEMS]: (props: ListItemsSlotProps<MasterImageGroup>) => {
                                const options : FormSelectOption[] = props.data.map((entity) => ({
                                    id: entity.id,
                                    value: entity.virtual_path,
                                }));

                                return buildFormSelect({
                                    validationTranslator: buildValidationTranslator(),
                                    validationResult: $v.value.group_virtual_path,
                                    label: true,
                                    labelContent: [
                                        'Group',
                                        isVirtualGroupPathDefined.value ?
                                            h('i', { class: 'fa fa-check text-success ml-1' }) :
                                            h(''),
                                    ],
                                    value: form.group_virtual_path,
                                    onChange(input) {
                                        const index = props.data.findIndex((el) => el.id === input);
                                        if (index !== -1) {
                                            selectGroup(props.data[index]);
                                            return;
                                        }

                                        selectGroup(null);
                                    },
                                    options,
                                });
                            },
                        }),
                    ],
                ),
                buildMasterImageVNode(),
            ],
        );
    },
});
