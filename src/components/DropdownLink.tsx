import Link, { LinkProps } from "next/link";
import { MenuItem } from "@headlessui/react";
import React, { PropsWithChildren, ButtonHTMLAttributes } from "react";

const DropdownLink = ({ children, ...props }: PropsWithChildren<LinkProps>) => (
  <MenuItem>
    {({ active }) => (
      <Link
        {...props}
        className={`w-full text-left block px-4 py-2 text-sm leading-5 text-gray-700 ${
          active ? "bg-gray-100" : ""
        } focus:outline-none transition duration-150 ease-in-out`}
      >
        {children}
      </Link>
    )}
  </MenuItem>
);

export const DropdownButton = ({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) => (
  <MenuItem>
    {({ active }) => (
      <button
        className={`w-full text-left block px-4 py-2 text-sm leading-5 text-gray-700 ${
          active ? "bg-gray-100" : ""
        } focus:outline-none transition duration-150 ease-in-out`}
        {...props}
      >
        {children}
      </button>
    )}
  </MenuItem>
);

export default DropdownLink;
