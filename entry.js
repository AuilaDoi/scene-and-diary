import { extension_prompt_roles, extension_prompt_types, setExtensionPrompt } from '../../../../script.js';
import { getContext } from '../../../st-context.js';
import { install } from './dist/index.js';

install(getContext, (text, depth = 0) => {
    setExtensionPrompt('scene_diary_diaries', '', extension_prompt_types.NONE, 0, false, extension_prompt_roles.SYSTEM);
    setExtensionPrompt('scene_diary_memories', text, text ? extension_prompt_types.IN_CHAT : extension_prompt_types.NONE,
        depth, false, extension_prompt_roles.SYSTEM);
});
