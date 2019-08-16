import {
  Component,
  HostListener,
  OnInit,
  Renderer2,
  ViewChild,
  ElementRef,
  Inject,
  PLATFORM_ID,
  OnDestroy
} from '@angular/core';
import { resolutions, Tree, SvgTree, TreeNode } from './tree.utils';
import { TreeService } from './tree.service';
import { linkHorizontal } from 'd3-shape';
import {
  hierarchy,
  tree as treeLayout,
  HierarchyPointLink
} from 'd3-hierarchy';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { select, event } from 'd3-selection';
import { zoom } from 'd3-zoom';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html'
})
export class TreeComponent implements OnInit, OnDestroy {
  @ViewChild('svg', { static: true }) public svg: ElementRef;
  @ViewChild('gZoom', { static: true }) public gZoom: ElementRef;

  public tree: SvgTree<Tree> = {
    height: 0,
    width: 0,
    margin: {
      top: 50,
      left: 150,
      bottom: 50,
      right: 50
    },
    data: null,
    links: [],
    nodes: []
  };

  constructor(
    private readonly treeService: TreeService,
    private readonly renderer: Renderer2,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  public ngOnInit(): void {
    this.treeService.readFile<Tree>().subscribe(data => {
      this.tree.data = data;
      if (isPlatformServer(this.platformId)) {
        this.render(data);
      }
    });

    // check that platformisbrowser before add listener using d3
    if (isPlatformBrowser(this.platformId)) {
      select(this.svg.nativeElement).call(
        zoom().on('zoom', () => {
          this.renderer.setAttribute(
            this.gZoom.nativeElement,
            'transform',
            event.transform
          );
        })
      );
    }
  }

  @HostListener('window:resize', resolutions)
  @HostListener('window:load', resolutions)
  public onload(height: number, width: number) {
    if (height < 1000) {
      this.tree.height = 1000;
    } else {
      this.tree.height = height;
    }
    this.tree.width = width;
    this.render(this.tree.data);
  }

  public render(data: Tree) {
    const tree = treeLayout().size([this.height, this.width]);
    const root = hierarchy(data);
    this.tree.nodes = (root.descendants() as unknown) as TreeNode[];
    this.tree.links = tree(root).links();
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

  public ngOnDestroy(): void {
    // remove d3 listener on destroy component
    select(this.svg.nativeElement).on('zoom', null);
  }
}
