import { Component, HostListener, OnInit, Renderer2 } from '@angular/core';
import { resolutions, Tree, SvgTree, TreeNode } from './tree.utils';
import { TreeService } from './tree.service';
import { linkHorizontal } from 'd3-shape';
import {
  hierarchy,
  tree as treeLayout,
  HierarchyPointLink
} from 'd3-hierarchy';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnInit {
  private zoomLevels: { scale: number; top: number; left: number } = {
    scale: 1,
    top: 0,
    left: 0
  };
  public clicked: { top: number; left: number } | null = null;
  public tree: SvgTree<Tree> = {
    height: 0,
    width: 0,
    margin: {
      top: 100,
      left: 100,
      bottom: 100,
      right: 100
    },
    data: null,
    links: [],
    nodes: [],
    zoom: ''
  };

  constructor(
    private readonly treeService: TreeService,
    private readonly renderer: Renderer2
  ) {}

  @HostListener('window:resize', resolutions)
  @HostListener('window:load', resolutions)
  public onload(height: number, width: number) {
    this.tree.height = height;
    this.tree.width = width;
    this.render(this.tree.data);
  }

  public render(data: Tree) {
    const tree = treeLayout().size([this.height, this.width]);
    const root = hierarchy(data);
    this.tree.nodes = (root.descendants() as unknown) as TreeNode[];
    this.tree.links = tree(root).links();
  }

  public ngOnInit(): void {
    this.treeService.readFile<Tree>().subscribe(data => {
      this.tree.data = data;
    });
  }

  get width() {
    return Math.abs(
      this.tree.width - this.tree.margin.left - this.tree.margin.right
    );
  }

  get height() {
    return Math.abs(
      this.tree.height - this.tree.margin.top - this.tree.margin.bottom
    );
  }

  public concat(...args: Array<number | string>) {
    return args.reduce((p, n) => p + n.toString(), '');
  }

  public generateLink(link: HierarchyPointLink<unknown>) {
    return (linkHorizontal()
      .x(({ y }: any) => y)
      .y(({ x }: any) => x) as any)(link);
  }

  public zoom(e: WheelEvent, parent: HTMLOptGroupElement) {
    e.preventDefault();
    e.stopPropagation();
    if (e.deltaY > 0 && this.zoomLevels.scale < 15) {
      this.zoomLevels.scale += 0.5;
    } else if (e.deltaY < 0 && this.zoomLevels.scale > 0.1) {
      if (this.zoomLevels.scale > 1.5) {
        this.zoomLevels.scale -= 0.5;
      } else {
        this.zoomLevels.scale -= 0.1;
      }
    }
    this.setTransform(parent);
  }

  public onMoveItem(
    e: MouseEvent,
    top: number,
    left: number,
    parent: HTMLOptGroupElement
  ) {
    if (!this.clicked) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    this.zoomLevels.top = this.zoomLevels.top + top - this.clicked.top;
    this.clicked.top = top;
    this.zoomLevels.left = this.zoomLevels.left + left - this.clicked.left;
    this.clicked.left = left;

    this.setTransform(parent);
  }

  private setTransform(parent: HTMLOptGroupElement): void {
    this.renderer.setStyle(
      parent,
      'transform',
      `scale(${this.zoomLevels.scale}) translate(${this.zoomLevels.top}px, ${
        this.zoomLevels.left
      }px)`
    );
  }
}
