import React, { ChangeEvent } from 'react'
import styled from 'styled-components'
import { Tag } from 'src/tags/background/types'
import { ActiveTab } from 'src/tags/ui/TagPicker/components/ActiveTab'
import { X as XIcon } from '@styled-icons/feather'
import { darken } from 'polished'

interface Props {
    tagsSelected: Tag[]
    onPress: (tag: Tag) => void
}
export class TagSelectedList extends React.PureComponent<Props> {
    _getTagAttr = event => ({
        name: event.target.getAttribute('data-tag-name'),
        url: event.target.getAttribute('data-tag-url'),
    })

    handleSelectedTabPress = (event: ChangeEvent) =>
        this.props.onPress(this._getTagAttr(event))

    render() {
        return (
            <React.Fragment>
                {this.props.tagsSelected?.map(tag => (
                    <StyledActiveTab
                        key={`ActiveTab-${tag.name}`}
                        data-tag-name={tag.name}
                        data-tag-url={tag.url}
                        onClick={this.handleSelectedTabPress}
                    >
                        {tag.name}
                        <StyledXIcon size={12} />
                    </StyledActiveTab>
                ))}
            </React.Fragment>
        )
    }
}

const StyledActiveTab = styled(ActiveTab)`
    display: inline-flex;
`

const StyledXIcon = styled(XIcon)`
    stroke: ${props => props.theme.tag.text};
    stroke-width: 2px;
    margin-left: 4px;

    &:hover {
        stroke-width: 3px;
        stroke: darken(0.2, ${props => props.theme.tag.text});
    }
`
