import { HierarchyPointLink } from 'd3-hierarchy';

export const resolutions = [
  '$event.path[0].innerHeight',
  '$event.path[0].innerWidth'
];

export interface Data {
  id: string;
}

export interface Tree {
  data: Data;
  children: Array<Tree>;
}

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface TreeNode {
  x: number;
  y: number;
  depth: number;
  data: {
    data: {
      id: string;
    };
  };
}

export interface SvgTree<T = any> {
  height: number;
  width: number;
  margin: Margin;
  data: T;
  links: Array<HierarchyPointLink<unknown>>;
  nodes: TreeNode[];
}
