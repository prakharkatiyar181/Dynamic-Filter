import * as React from "react";
import { Button as MuiButton, styled } from "@mui/material";

const StyledButton = styled(MuiButton)(({ theme }) => ({
}));

interface ButtonProps extends React.ComponentProps<typeof MuiButton> {}

function Button({
  variant = "contained",
  size = "medium",
  ...props
}: ButtonProps) {
  return (
    <StyledButton
      variant={variant}
      size={size}
      {...props}
    />
  );
}

export { Button };
