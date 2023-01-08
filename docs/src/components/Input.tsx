import React from 'react';
import clsx from 'clsx';

import classes from './Input.module.css';

export const Input = ({
	className,
	...oth
}: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) => (
	<input className={clsx(classes['input'], className)} {...oth} />
);
