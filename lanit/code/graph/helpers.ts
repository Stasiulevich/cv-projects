import { QueryParams } from 'types/queryParams';
import queryString from 'query-string';
import _, { cloneDeep } from 'lodash';

export const getQueryParams = (search: string) => {
  const params: QueryParams = queryString.parse(search, {
    parseNumbers: false,
    arrayFormat: 'comma',
    parseBooleans: true,
  });

  if (params.supplierIDs) {
    if (!Array.isArray(params.supplierIDs)) {
      params.supplierIDs = [params.supplierIDs];
    }
  }

  return params;
};

const isNode = (node) => node.classes.includes('node');

const isEdge = (node) => node.classes.includes('edge');

const getNodeById = (nodeId, nodes) => nodes.find((node) => node.id == nodeId);

const getConnectedNodes = (edge, elements) =>
  elements.filter(
    (el) => isNode(el) && (el.id == edge.source || el.id == edge.target) && !el.visited
  );

const getConnectedEdges = (node, elements) =>
  elements.filter(
    (el) => isEdge(el) && (node.id == el.source || node.id == el.target) && !el.visited
  );

const isRootNode = (node, rootIds) => rootIds.includes(node.id); // uncorrect

const getRootNode = (nodes, rootIds) => {
  return nodes.filter((node) => isRootNode(node, rootIds));
};

const getItemsIds = (elements) => {
  return elements.map((element) => element.id);
};

const deleteItemsFromGraph = (elements, rootIds) =>
  elements.filter((element) => !(element.delete && rootIds.includes(element.id)));

const prepareItemsForDelete = (ids, elements) =>
  elements.map((element) =>
    ids.includes(element.id) ? { ...element, delete: true, visited: true } : element
  );

const cancelNodesForDelete = (elements, startNode) =>
  elements.map((element) =>
    element.id != startNode.id && element.source != startNode.id && element.target != startNode.id
      ? { ...element, delete: false }
      : element
  );

const filterItemsInDepthWithDeleting = (
  graphElement,
  startNode,
  edges,
  nodes,
  rootIds,
  isFirstIteration = false
): { resultEdges: any; resultNodes: any } => {
  let resultEdges = cloneDeep(edges);
  let resultNodes = cloneDeep(nodes);
  const isRoot = isNode(graphElement) && rootIds.includes(graphElement.id);
  //debugger;
  if (
    !isRoot &&
    (isFirstIteration || graphElement.id != startNode.id) &&
    isNode(graphElement) &&
    !graphElement.visited
  ) {
    const connectedEdges = filterHelper.getConnectedEdges(graphElement, resultEdges);
    const edgeIds = filterHelper.getItemsIds(connectedEdges);

    resultNodes = filterHelper.prepareItemsForDelete([graphElement.id], resultNodes);
    if (edgeIds && edgeIds.length) {
      resultEdges = filterHelper.prepareItemsForDelete(edgeIds, resultEdges);

      connectedEdges.forEach((edge) => {
        if (!edge.visited) {
          const connectedNodes = filterHelper.getConnectedNodes(edge, resultNodes);
          const nodeIds = filterHelper.getItemsIds(connectedNodes);

          resultNodes = filterHelper.prepareItemsForDelete(nodeIds, resultNodes);
          // unnecessary
          resultEdges = filterHelper.prepareItemsForDelete([edge.id], resultEdges);
          connectedNodes.forEach((connectedNode) => {
            if (!connectedNode.visited) {
              //      debugger;
              const result = filterItemsInDepthWithDeleting(
                connectedNode,
                startNode,
                resultEdges,
                resultNodes,
                rootIds
              );
              //    debugger;
              resultEdges = result?.resultEdges;
              resultNodes = result?.resultNodes;
              return { resultEdges, resultNodes };
            }
          });
        }
      });
    } else {
      resultNodes = deleteItemsFromGraph(resultNodes, rootIds);
      resultEdges = deleteItemsFromGraph(resultEdges, rootIds);

      return { resultEdges, resultNodes };
    }
  } else if (isEdge(graphElement) && !graphElement.visited) {
    // todo copypast
    const connectedNodes = filterHelper.getConnectedNodes(graphElement, resultNodes);
    const nodeIds = filterHelper.getItemsIds(connectedNodes);

    resultNodes = filterHelper.prepareItemsForDelete(nodeIds, resultNodes);
    resultEdges = filterHelper.prepareItemsForDelete([graphElement.id], resultEdges);
    connectedNodes.forEach((connectedNode) => {
      if (!connectedNode.visited) {
        //debugger;
        const result = filterItemsInDepthWithDeleting(
          connectedNode,
          startNode,
          resultEdges,
          resultNodes,
          rootIds
        );
        //debugger;
        resultEdges = result?.resultEdges;
        resultNodes = result?.resultNodes;
        return { resultEdges, resultNodes };
      }
    });
  }
  resultNodes = deleteItemsFromGraph(cancelNodesForDelete(resultNodes, startNode), rootIds);
  resultEdges = deleteItemsFromGraph(cancelNodesForDelete(resultEdges, startNode), rootIds);

  return { resultEdges, resultNodes };
};

const findConnectedComponents = (nodes, edges) => {
  // set assigned as field
  let numComponent = 1;

  const dfs = (nodeId) => {
    const currentNode = getNodeById(nodeId, nodes);
    if (currentNode) {
      currentNode.assignedComponent = numComponent;
      edges.forEach((edge) => {
        if (edge.source == nodeId && getNodeById(edge.target, nodes).assignedComponent === 0) {
          edge.assignedComponent = numComponent;
          dfs(edge.target);
        } else if (
          edge.target == nodeId &&
          getNodeById(edge.source, nodes).assignedComponent === 0
        ) {
          edge.assignedComponent = numComponent;
          dfs(edge.source);
        }
      });
    }
  };

  nodes.forEach((node) => {
    if (node.assignedComponent === 0) {
      dfs(node.id);
      numComponent++;
    }
  });

  return { nodes, edges };
};

const firstDelete = (graphElement, nodes, edges) => {
  let resultEdges = cloneDeep(edges);
  let resultNodes = cloneDeep(nodes);

  if (isNode(graphElement)) {
    resultNodes = resultNodes.filter((node) => node.id != graphElement.id); // delete item method
    resultEdges = resultEdges.filter(
      (edge) => edge.source != graphElement.id && edge.target != graphElement.id
    );
  }

  if (isEdge(graphElement)) resultEdges = resultEdges.filter((edge) => edge.id != graphElement.id); // delete item method

  return { resultEdges, resultNodes };
};

const secondDelete = (nodes, edges, rootIds) => {
  // optimize edges delete
  const rootNumComponent = getRootNode(nodes, rootIds)?.map((node) => node.assignedComponent) || [];
  const deleteNodesId: any[] = [];

  //const resultEdges = edges.filter((edge) => edge.assignedComponent === rootNumComponent);
  //const resultNodes = nodes.filter((node) => node.assignedComponent === rootNumComponent);
  const resultNodes = nodes.filter((node) => {
    if (rootNumComponent.includes(node.assignedComponent)) return true;
    else {
      deleteNodesId.push(node.id);
      return false;
    }
  });

  const resultEdges = edges.filter(
    (edge) => !deleteNodesId.includes(edge.source) && !deleteNodesId.includes(edge.target)
  );

  return { resultNodes, resultEdges };
};

const filterGraphWithDelete = (graphElement, nodes, edges, rootNodesId) => {
  const element = { ...graphElement, assignedComponent: 0 };
  const cleanNodes = nodes.map((node) => ({ ...node, assignedComponent: 0 }));
  const cleanEdges = edges.map((edge) => ({ ...edge, assignedComponent: 0 }));

  const firstStep = filterHelper.firstDelete(element, cleanNodes, cleanEdges);
  const secondStep = filterHelper.findConnectedComponents(
    firstStep.resultNodes,
    firstStep.resultEdges
  );
  const result = filterHelper.secondDelete(secondStep.nodes, secondStep.edges, rootNodesId);

  return result;
};

export const filterHelper = {
  isEdge,
  isNode,
  isRootNode,
  getConnectedNodes,
  getConnectedEdges,
  getItemsIds,
  deleteItemsFromGraph,
  prepareItemsForDelete,
  filterItemsInDepthWithDeleting,
  firstDelete,
  secondDelete,
  findConnectedComponents,
  filterGraphWithDelete,
};
