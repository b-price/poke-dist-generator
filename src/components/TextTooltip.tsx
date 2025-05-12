import React, {ReactElement} from "react";
import {OverlayTrigger, Tooltip} from "react-bootstrap";

interface TextTooltipProps {
    id: string;
    children: ReactElement;
    text: string;
}

export const TextTooltip: React.FC<TextTooltipProps> = ({id, text, children}) => {
    return (
        <OverlayTrigger overlay={<Tooltip id={id}>{text}</Tooltip>}>
            {children}
        </OverlayTrigger>
    )
}