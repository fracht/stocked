import { createPxth } from 'pxth';

import { areProxyMapsEqual } from '../../src/utils/areProxyMapsEqual';

describe('areProxyMapsEqual', () => {
	it('should return false if objects have different amount of entries', () => {
		expect(areProxyMapsEqual({}, { a: createPxth([]) })).toBeFalsy();
		expect(areProxyMapsEqual({ a: createPxth([]) }, {})).toBeFalsy();
		expect(areProxyMapsEqual({ a: createPxth([]) }, { a: createPxth([]), b: createPxth([]) })).toBeFalsy();
	});

	it('should return false when objects differ', () => {
		expect(areProxyMapsEqual({ a: createPxth(['hello1']) }, { a: createPxth(['hello']) })).toBeFalsy();
		expect(areProxyMapsEqual({ a: createPxth(['bye']) }, { b: createPxth(['bye']) })).toBeFalsy();
	});

	it('should return true if objects are same', () => {
		expect(areProxyMapsEqual({ a: createPxth([]) }, { a: createPxth([]) })).toBeTruthy();
		expect(areProxyMapsEqual({ a: createPxth(['bye']) }, { a: createPxth(['bye']) })).toBeTruthy();
	});

	it('should compare 2 nested objects', () => {
		expect(
			areProxyMapsEqual(
				{
					registrationDate: createPxth(['registeredUser', 'dates', 'registration']),
					personalData: {
						name: {
							firstName: createPxth(['registeredUser', 'name']),
							lastName: createPxth(['registeredUser', 'surname']),
						},
						birthday: createPxth(['dateOfBirth']),
					},
				},
				{
					registrationDate: createPxth(['registeredUser', 'dates', 'registration']),
					personalData: {
						name: {
							firstName: createPxth(['registeredUser', 'name']),
							lastName: createPxth(['registeredUser', 'surname']),
						},
						birthday: createPxth(['dateOfBirth']),
					},
				},
			),
		).toBeTruthy();

		expect(
			areProxyMapsEqual(
				{
					registrationDate: createPxth(['registeredUser', 'dates', 'registration']),
					personalData: {
						name: {
							firstName: createPxth(['registeredUser', 'name']),
							lastName: createPxth(['registeredUser', 'surname']),
						},
						birthday: createPxth(['dateOfBirth']),
					},
				},
				{
					registrationDate: createPxth(['registeredUser', 'dates', 'registration']),
					personalData: {
						name: {
							firstName: createPxth(['registeredUser', 'name']),
							lastName: createPxth(['registeredUser', 'surname']),
							// Added additional property
							additionalData: createPxth(['hello', 'world']),
						},
						birthday: createPxth(['dateOfBirth']),
					},
				},
			),
		).toBeFalsy();

		expect(
			areProxyMapsEqual(
				{
					registrationDate: createPxth(['registeredUser', 'dates', 'registration']),
					personalData: {
						name: {
							// Changed path
							firstName: createPxth(['name', 'registeredUser']),
							lastName: createPxth(['registeredUser', 'surname']),
						},
						birthday: createPxth(['dateOfBirth']),
					},
				},
				{
					registrationDate: createPxth(['registeredUser', 'dates', 'registration']),
					personalData: {
						name: {
							firstName: createPxth(['registeredUser', 'name']),
							lastName: createPxth(['registeredUser', 'surname']),
							additionalData: createPxth(['hello', 'world']),
						},
						birthday: createPxth(['dateOfBirth']),
					},
				},
			),
		).toBeFalsy();

		expect(
			areProxyMapsEqual(
				{
					registrationDate: createPxth(['registeredUser', 'dates', 'registration']),
					// Changed name
					personalDataMODIFIED: {
						name: {
							firstName: createPxth(['name', 'registeredUser']),
							lastName: createPxth(['registeredUser', 'surname']),
						},
						birthday: createPxth(['dateOfBirth']),
					},
				},
				{
					registrationDate: createPxth(['registeredUser', 'dates', 'registration']),
					personalData: {
						name: {
							firstName: createPxth(['registeredUser', 'name']),
							lastName: createPxth(['registeredUser', 'surname']),
							additionalData: createPxth(['hello', 'world']),
						},
						birthday: createPxth(['dateOfBirth']),
					},
				},
			),
		).toBeFalsy();
	});
});
