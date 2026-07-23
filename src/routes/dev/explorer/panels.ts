/**
 * Panel registry for the Project Explorer (doc 09).
 *
 * Each milestone adds panels by appending an entry here and creating the matching
 * child route directory; the shell's nav and overview table render from this list.
 */
export interface ExplorerPanel {
	id: string;
	label: string;
	path: string;
	milestone: number;
	status: 'available' | 'planned';
}

export const panels: ExplorerPanel[] = [
	{ id: 'overview', label: 'Overview', path: '/dev/explorer', milestone: 1, status: 'available' },
	{
		id: 'prng',
		label: 'PRNG Output',
		path: '/dev/explorer/prng',
		milestone: 1,
		status: 'available',
	},
	{
		id: 'types',
		label: 'Type Index',
		path: '/dev/explorer/types',
		milestone: 1,
		status: 'available',
	},
	{
		id: 'structure',
		label: 'Structure Viewer',
		path: '/dev/explorer/structure',
		milestone: 2,
		status: 'available',
	},
];
