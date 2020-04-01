import { fontSizeSmall } from 'src/common-ui/components/design-library/typography'
import styled from 'styled-components'

const backgroundHoverSelected = props => {
    if (props.selected || props.isFocused) {
        return props.theme.tag.selected
    } else if (!props.selected) {
        if (props.isFocused) {
            return props.theme.tag.selected
        } else {
            return props.theme.tag.tag
        }
    }
}

export const TagResultItem = styled.div`
    display: flex;
    min-height: 16px;
    background: ${props =>
        props.selected ? props.theme.tag.selected : props.theme.tag.tag};
    border: 2px solid
        ${props => (props.selected ? props.theme.tag.tag : 'transparent')};
    border-radius: 5px;
    color: ${props => props.theme.tag.text};
    padding: 0 8px;
    margin: 2px 4px 2px 0;
    font-size: ${fontSizeSmall}px;
    transition: all 0.1s;

    &:hover {
        cursor: pointer;
    }
`
