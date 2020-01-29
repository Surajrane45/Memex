import { bodyLoader, interactiveLoader } from 'src/util/loader'
import ToolbarNotifications from 'src/toolbar-notification/content_script'
import * as interactions from './ribbon-interactions'
import { getSidebarState } from '../utils'
import AnnotationsManager from 'src/annotations/annotations-manager'
import { runOnScriptShutdown } from 'src/content-tooltip/utils'
import { HighlightInteractionInterface } from 'src/highlighting/types'

interface ContentScriptProps {
    annotationsManager: AnnotationsManager
    toolbarNotifications: ToolbarNotifications
    highlighter: HighlightInteractionInterface
}

// TODO (ch - annotations extra) - huh? If commenting this out doesn't break anything remove it
// const onKeydown = (
//     e: KeyboardEvent,
//     props: ContentScriptProps,
// ) => {
//     if (e.key !== 'm') {
//         return
//     }
//     interactions.insertRibbon(props)
// }

const initRibbonAndSidebar = async ({
    annotationsManager,
    toolbarNotifications,
}: {
    annotationsManager: AnnotationsManager
    toolbarNotifications: ToolbarNotifications
}) => {
    runOnScriptShutdown(() => interactions.removeRibbon())
    interactions.setupRPC({ annotationsManager, toolbarNotifications })

    const isSidebarEnabled = await getSidebarState()
    if (!isSidebarEnabled) {
        return
    }
    // // TODO (ch - annotations extra) - huh?
    // const onKeydownWrapper = (e: KeyboardEvent) => {
    //     onKeydown(e, { annotationsManager, toolbarNotifications })
    // }

    await interactiveLoader()
    // TODO (ch - annotations extra) - huh?
    // document.addEventListener('keydown', onKeydownWrapper, false)

    await bodyLoader()
    // TODO (ch - annotations extra) - huh?
    // document.removeEventListener('keydown', onKeydownWrapper, false)

    interactions.insertRibbon({ annotationsManager, toolbarNotifications })
}

export default initRibbonAndSidebar
