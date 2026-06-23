import { Component, Input, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import { ECONode, ECOTree } from '@shared/interfaces/econode.type';

@Component({
  selector: 'app-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.scss']
})
export class TreeViewComponent implements OnInit {

  @Input() template: TemplateRef<any>;
  @Input() data: any;

  tree:ECOTree = new ECOTree();

  constructor() { }

  ngOnInit(): void {
    // this.tree = new ECOTree();
     this.addNodes( this.tree, this.data );
     this.tree.UpdateTree();

     this.tree.nDatabaseNodes.forEach( node => {
      node.paths = node._drawChildrenLinks(this.tree)
     });

     this.centrarPrimerNodo();
  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  get nodes(){
    return this.tree.nDatabaseNodes
  }

  centrarPrimerNodo() {
    if (!this.data || this.data.length === 0) return;
    const idDelPrimerNodo = this.data.data.id;
    const idHTML = 'nodo-' + idDelPrimerNodo; // Ej: 'nodo-1'

    // Usamos setTimeout para dar tiempo a que app-tree-view dibuje el template
    setTimeout(() => {
      const elementoNativo = document.getElementById(idHTML);

      if (elementoNativo) {
        elementoNativo.scrollIntoView({
          behavior: 'smooth',
          block: 'center',  // Centra verticalmente
          inline: 'center'  // Centra horizontalmente si hay scroll en X
        });
      } else {
        console.warn('No se encontró el nodo en el DOM con ID:', idHTML);
      }
    }, 100); // 100ms suele ser suficiente para que Angular y el componente hijo terminen de renderizar
  }

  getChildren(node:ECONode,nodes:ECONode[]=[])
  {
     const children=node.nodeChildren;
     if (children && children.length){
        nodes=[...nodes,...children]
        children.forEach(x=>{
          nodes=this.getChildren(x,nodes)
        })
     }
     return nodes
  }
  getParent(node:ECONode,nodes:ECONode[]=[])
  {
     if (node.nodeParent){
        nodes=[...nodes,node.nodeParent]
        nodes=this.getParent(node.nodeParent,nodes)
     }
     return nodes
  }

  getSlibingNodes(node:ECONode){
     return [...this.getParent(node),...this.getChildren(node)]
  }

  private addNodes(tree:ECOTree,node:any,parent:any=null)
  {
    parent=parent || {id:-1,width:null,height:null,color:null,background:null,linkColor:null}
    node.width=node.width || parent.width
    node.height=node.height || parent.height
    node.color=node.color || parent.color
    node.background='transparent'
    node.linkColor= 'black'
    node.id=tree.nDatabaseNodes.length
      tree.add(node.id,parent.id,node.title, node.width, node.height, node.color, node.background, node.linkColor, node.data,node.selected,node.active)
      if (node.children)
      {
      node.children.forEach((x:any)=>{
        this.addNodes(tree,x,node)
      })
      }
  }


}
