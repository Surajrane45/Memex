import React from 'react'
import styled from 'styled-components'
import { Tag } from 'src/tags/background/types'
import { TagResultItem } from 'src/tags/ui/TagPicker/components/TagResultItem'
import { Check, Layers } from '@styled-icons/feather'
import { StyledIconBase } from '@styled-icons/styled-icon'
import { lighten } from 'polished'

interface TagRowItemEvents {
    onPress: (tag: Tag) => void
}

interface State {
    isHovering: boolean
}

type Props = Tag & TagRowItemEvents & {}

class TagRow extends React.Component<Props, State> {
    state = { isHovering: false }
    handleTagPress = () => {
        const { url, name } = this.props
        this.props.onPress && this.props.onPress({ url, name })
    }

    render() {
        const { name } = this.props

        return (
            <Row
                onClick={this.handleTagPress}
                onMouseEnter={() => this.setState({ isHovering: true })}
                onMouseLeave={() => this.setState({ isHovering: false })}
            >
                <TagResultItem isHovering={this.state.isHovering}>
                    {name}
                </TagResultItem>
                <IconStyleWrapper>
                    <Layers size={24} />
                    <Check size={24} />
                </IconStyleWrapper>
            </Row>
        )
    }
}

const IconStyleWrapper = styled.div`
    ${StyledIconBase} {
        stroke-width: 2px;
        color: ${props => lighten(0.5, props.theme.text)};
        margin-left: 8px;

        &:hover {
            color: ${props => props.theme.text};
        }
    }
`

const Row = styled.div`
    align-items: center;
    border-bottom: 1px solid #e2e2ea;
    display: flex;
    padding: 4px 8px;
    justify-content: space-between;
    transition: background 0.3s;

    &:hover {
        background: #f7f7f9;
        cursor: pointer;
    }
`

export default styled(TagRow)``
