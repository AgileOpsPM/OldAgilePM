import * as React from "react";

function ArticleIcon({ fill = "#6C7281", ...rest }) {
  return (
    <svg
      width={24}
      height={24}
      fill="{none}"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path 
        d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM5 5h14v14H5V5zm4.5 3a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm7.5.75v1.5h-9v-1.5h9zm0-3v1.5h-9V6h9zM12 15H8v-1.5h4V15zm4.5-3H8v-1.5h8.5V12z" 
        fill="{fill}"
      />
      <path
        d="M14 17H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="{fill}"
      />
    </svg>
  );
} 

export default ArticleIcon;