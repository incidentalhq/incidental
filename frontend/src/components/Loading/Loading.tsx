import { faSpinner } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface Props {
  text?: string;
}

const Loading: React.FC<Props> = ({ text = "Loading..." }) => (
  <div>
    <FontAwesomeIcon icon={faSpinner} spin={true} fixedWidth={true} /> {text}
  </div>
);

export default Loading;
