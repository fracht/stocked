import React, { Fragment } from 'react';

export type HighlightWordPartProps = {
	fullWord: string;
	className: string;
	part?: string;
};

export const HighlightWordPart = ({ fullWord, part, className }: HighlightWordPartProps) => {
	const index = fullWord.indexOf(part || '');

	if (part && index !== -1) {
		return (
			<Fragment>
				{fullWord.substring(0, index)}
				<span className={className}>{part}</span>
				{fullWord.substring(index + part.length)}
			</Fragment>
		);
	}

	return <Fragment>{fullWord}</Fragment>;
};
