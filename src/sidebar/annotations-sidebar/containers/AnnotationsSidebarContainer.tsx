import * as React from 'react'
import styled from 'styled-components'
import { Subscription } from 'rxjs/Subscription'

import { StatefulUIElement } from 'src/util/ui-logic'
import AnnotationsSidebar, {
    AnnotationsSidebarProps,
} from '../components/AnnotationsSidebar'
import {
    SidebarContainerLogic,
    SidebarContainerState,
    SidebarContainerEvents,
    SidebarContainerOptions,
    AnnotationEventContext,
} from './logic'
import { ButtonTooltip } from 'src/common-ui/components'
import { AnnotationFooterEventProps } from 'src/annotations/components/AnnotationFooter'
import { Annotation } from 'src/annotations/types'

const DEF_CONTEXT: { context: AnnotationEventContext } = {
    context: 'pageAnnotations',
}

export interface Props extends SidebarContainerOptions {
    setRef?: (sidebar: AnnotationsSidebarContainer) => void
}

export class AnnotationsSidebarContainer<
    P extends Props = Props
> extends StatefulUIElement<P, SidebarContainerState, SidebarContainerEvents> {
    annotationSubscription: Subscription

    constructor(props: P) {
        super(props, new SidebarContainerLogic(props))

        if (props.setRef) {
            props.setRef(this)
        }
    }

    componentDidMount() {
        super.componentDidMount()
        this.setupAnnotationCacheListeners()
    }

    componentWillUnmount() {
        super.componentWillUnmount()
        this.cleanupAnnotationCacheListeners()
    }

    private setupAnnotationCacheListeners() {
        this.annotationSubscription = this.props.annotationsCache.annotations.subscribe(
            (annotations) => this.setState({ annotations }),
        )
    }

    private cleanupAnnotationCacheListeners() {
        this.annotationSubscription.unsubscribe()
    }

    showSidebar() {
        this.processEvent('show', null)
    }

    hideSidebar() {
        this.processEvent('hide', null)
    }

    setPageUrl = (pageUrl: string) => {
        this.processEvent('setPageUrl', { pageUrl })
    }

    private handleClickOutside = (e) => {
        if (this.props.onClickOutside) {
            return this.props.onClickOutside(e)
        }

        // Do not close the sidebar if clicked on a highlight in the page
        if (e.target?.dataset?.annotation) {
            return
        }

        if (this.state.showState === 'visible') {
            this.hideSidebar()
        }
    }

    protected bindAnnotationFooterEventProps(
        annotation: Annotation,
    ): AnnotationFooterEventProps {
        return {
            onEditIconClick: () =>
                this.processEvent('setAnnotationEditMode', {
                    annotationUrl: annotation.url,
                    ...DEF_CONTEXT,
                }),
            toggleBookmark: () =>
                this.processEvent('toggleAnnotationBookmark', {
                    annotationUrl: annotation.url,
                    ...DEF_CONTEXT,
                }),
            onDeleteIconClick: () =>
                this.processEvent('switchAnnotationMode', {
                    annotationUrl: annotation.url,
                    mode: 'delete',
                    ...DEF_CONTEXT,
                }),
            onDeleteCancel: () =>
                this.processEvent('switchAnnotationMode', {
                    annotationUrl: annotation.url,
                    mode: 'default',
                    ...DEF_CONTEXT,
                }),
            onDeleteConfirm: () =>
                this.processEvent('deleteAnnotation', {
                    annotationUrl: annotation.url,
                    ...DEF_CONTEXT,
                }),
            onEditCancel: () =>
                this.processEvent('switchAnnotationMode', {
                    annotationUrl: annotation.url,
                    mode: 'default',
                    ...DEF_CONTEXT,
                }),
            onEditConfirm: () =>
                this.processEvent('editAnnotation', {
                    annotationUrl: annotation.url,
                    ...DEF_CONTEXT,
                }),
            onGoToAnnotation: annotation.body?.length
                ? () =>
                      this.processEvent('goToAnnotation', {
                          annotationUrl: annotation.url,
                          ...DEF_CONTEXT,
                      })
                : undefined,
        }
    }

    protected getEditProps(): AnnotationsSidebarProps['annotationEditProps'] {
        const { commentBox } = this.state

        return {
            isTagInputActive: commentBox.form.isTagInputActive,
            comment: commentBox.form.commentText,
            tags: commentBox.form.tags,
            updateTags: (args) =>
                this.processEvent('updateTagsForNewComment', args),
            deleteSingleTag: (tag) =>
                this.processEvent('deleteNewPageCommentTag', { tag }),
            setTagInputActive: (active) =>
                this.processEvent('setNewPageCommentTagPicker', { active }),
            onCommentChange: (comment) =>
                this.processEvent('changePageCommentText', { comment }),
            onEditConfirm: (annotationUrl) =>
                this.processEvent('editAnnotation', {
                    annotationUrl,
                    ...DEF_CONTEXT,
                }),
        }
    }

    protected getEditableProps(): AnnotationsSidebarProps['annotationEditableProps'] {
        return {
            onMouseEnter: (url) =>
                this.processEvent('annotationMouseEnter', {
                    annotationUrl: url,
                }),
            onMouseLeave: (url) =>
                this.processEvent('annotationMouseLeave', {
                    annotationUrl: url,
                }),
            onGoToAnnotation: (url) =>
                this.processEvent('goToAnnotation', {
                    annotationUrl: url,
                    ...DEF_CONTEXT,
                }),
        }
    }

    protected getCreateProps(): AnnotationsSidebarProps['annotationCreateProps'] {
        return {
            anchor: this.state.commentBox.anchor,
            onCancel: () => this.processEvent('cancelNewPageComment', null),
            onSave: ({ text, isBookmarked, ...args }) =>
                this.processEvent('saveNewPageComment', {
                    commentText: text,
                    bookmarked: isBookmarked,
                    ...args,
                }),
        }
    }

    protected getTagProps(): AnnotationsSidebarProps['annotationTagProps'] {
        return {
            loadDefaultSuggestions: () =>
                this.props.tags.fetchInitialTagSuggestions(),
            queryEntries: (query) =>
                this.props.tags.searchForTagSuggestions({ query }),
        }
    }

    private handleAddCommentBtnClick: React.MouseEventHandler = (e) => {
        e.preventDefault()

        if (this.state.showCommentBox) {
            this.processEvent('cancelNewPageComment', null)
        } else {
            this.processEvent('addNewPageComment', null)
        }
    }

    private renderTopBar() {
        return (
            <TopBarContainerStyled>
                {this.props?.elements?.topBarLeft}
                <ButtonTooltip
                    tooltipText="Add notes to page"
                    position="leftNarrow"
                >
                    <CommentBtn onClick={this.handleAddCommentBtnClick} />
                </ButtonTooltip>
            </TopBarContainerStyled>
        )
    }

    render() {
        if (this.state.showState === 'hidden') {
            return null
        }

        return (
            <ContainerStyled>
                {this.renderTopBar()}
                <AnnotationsSidebar
                    {...this.state}
                    appendLoader={this.state.secondarySearchState === 'running'}
                    annotationModes={this.state.annotationModes.pageAnnotations}
                    isAnnotationCreateShown={this.state.showCommentBox}
                    hoverAnnotationUrl={this.state.hoverAnnotationUrl}
                    annotationTagProps={this.getTagProps()}
                    annotationEditProps={this.getEditProps()}
                    annotationCreateProps={this.getCreateProps()}
                    annotationEditableProps={this.getEditableProps()}
                    bindAnnotationFooterEventProps={(url) =>
                        this.bindAnnotationFooterEventProps(url)
                    }
                    handleScrollPagination={() =>
                        this.processEvent('paginateSearch', null)
                    }
                    isSearchLoading={
                        this.state.primarySearchState === 'running'
                    }
                    onClickOutside={this.handleClickOutside}
                />
            </ContainerStyled>
        )
    }
}

const ContainerStyled = styled.div`
    padding: 10px;
    height: 100%;
    width: 450px;
    position: fixed;

    // TODO (sidebar-refactor) remove env usage
    //right: (props: Props) => (props.env === 'overview' ? 0 : 40)}px;
    //top: (props: Props) => (props.env === 'overview' ? 55 : 0)}px;
    right: 0;
    top: 0;

    z-index: 9999999; /* This is to combat pages setting high values on certain elements under the sidebar */
    background: #fff;
    transition: all 0.1s cubic-bezier(0.65, 0.05, 0.36, 1) 0s;
    box-shadow: rgba(15, 15, 15, 0.05) 0px 0px 0px 1px,
        rgba(15, 15, 15, 0.1) 0px 3px 6px, rgba(15, 15, 15, 0.2) 0px 9px 24px;
`

const TopBarContainerStyled = styled.div`
    position: sticky;
    top: 0;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 7px 8px 5px 3px;
    height: 40px;
    box-sizing: border-box;
    margin-top: 3px;
`

// TODO: inheirits from .nakedSquareButton
const CommentBtn = styled.button`
    background-color: #e8e8e8;
    color: rgb(54, 54, 46);
    border-radius: 3px;
    padding: 2px;
    background-image: url('/img/comment_add.svg');

    width: 25px;
    height: 25px;
    border-radius: 3px;
    opacity: 0.8;
    margin-left: 4px;
    background-size: 18px 18px;
    background-repeat: no-repeat;
    background-position: center;
    border: none;
    background-color: transparent;
    cursor: pointer;

    &:hover {
        opacity: 1;
    }

    &:active {
        opacity: 1;
    }

    &:focus {
        outline: none;
    }
`
