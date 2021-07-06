import clsx from 'clsx';
import React from 'react';
import classes from './Input.module.css';

export const Input = ({
    className,
    ...oth
}: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) => (
    <input className={clsx(classes['input'], className)} {...oth} />
);
