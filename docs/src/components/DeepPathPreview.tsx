import React, { ChangeEvent, useCallback, useState } from 'react';
import toPath from 'lodash/toPath';

import { Input } from './Input';
import { Tree } from './Tree';

import classes from './DeepPathPreview.module.css';

export type DeepPathPreviewProps = {
	object: object;
	initialPath: string;
};

export const DeepPathPreview = ({ object, initialPath }: DeepPathPreviewProps) => {
	const [path, setPath] = useState(initialPath);

	const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setPath(e.target.value);
	}, []);

	return (
		<div>
			<Input className={classes['input']} value={path} onChange={onChange} />
			<Tree selectedPath={toPath(path).filter(Boolean)} object={object} />
		</div>
	);
};
