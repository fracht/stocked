import React from 'react';
import clsx from 'clsx';

import { HighlightWordPart } from './HighlightWordPart';

import classes from './Tree.module.css';

export type TreeItemProps = {
	valueKey: string;
	value: unknown;
	selectedPath?: string[];
	isArrayItem?: boolean;
};

const openingBracket = (object: unknown) => (Array.isArray(object) ? '[' : '{');
const closingBracket = (object: unknown) => (Array.isArray(object) ? ']' : '}');

export const TreeItem = ({ valueKey, selectedPath, value, isArrayItem }: TreeItemProps) => {
	const isObject = typeof value === 'object' && value !== null;

	const highlight = selectedPath?.length === 1 && selectedPath?.[0] === valueKey;

	return (
		<li
			className={clsx(classes['tree__item'], highlight && classes['tree__item--highlighted'])}
			aria-expanded="true"
			role="treeitem"
		>
			<span>
				{!isArrayItem && (
					<>
						<HighlightWordPart
							className={classes['highlighted']}
							fullWord={valueKey}
							part={selectedPath?.length === 1 ? selectedPath?.[0] : undefined}
						/>
						{': '}
					</>
				)}
				{isObject ? openingBracket(value) : JSON.stringify(value) + ','}
			</span>
			{isObject && (
				<ul className={clsx(classes['tree__list'])} role="group">
					{Object.entries(value as object).map(([innerKey, innerValue]) => (
						<TreeItem
							selectedPath={selectedPath?.[0] === valueKey ? selectedPath?.slice(1) : undefined}
							key={innerKey}
							valueKey={innerKey}
							value={innerValue}
							isArrayItem={Array.isArray(value)}
						/>
					))}
				</ul>
			)}
			{isObject && closingBracket(value) + ','}
		</li>
	);
};

export type TreeProps = {
	object: object;
	selectedPath: string[];
};

export const Tree = ({ object, selectedPath }: TreeProps) => (
	<ul className={classes['tree']} role="tree">
		{Object.entries(object).map(([key, value]) => (
			<TreeItem selectedPath={selectedPath} key={key} valueKey={key} value={value} />
		))}
	</ul>
);
