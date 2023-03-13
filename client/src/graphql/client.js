import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient as createWsClient } from "graphql-ws";
import { Kind, OperationTypeNode } from "graphql";
import { getAccessToken } from "../auth";

const GRAPHQL_HTTP_URL = "http://localhost:9000/graphql";
const GRAPHQL_WS_URL = "ws://localhost:9000/graphql";

const httpLink = new HttpLink({
  uri: GRAPHQL_HTTP_URL,
});
const wsLink = new GraphQLWsLink(
  createWsClient({
    url: GRAPHQL_WS_URL,
    connectionParams: () => ({ accessToken: getAccessToken() }),
  })
);

function isSubscription({ query }) {
  const defination = getMainDefinition(query);
  return (
    defination.kind === Kind.OPERATION_DEFINITION &&
    defination.operation === OperationTypeNode.SUBSCRIPTION
  );
}
export const client = new ApolloClient({
  link: split(isSubscription, wsLink, httpLink),
  cache: new InMemoryCache(),
});

export default client;
