import { FastifyPluginAsync } from "fastify";
import GeneratingDialogueHandler from "./GeneratingDialogue.handler.mts";

const generatingDialogueHandler = new GeneratingDialogueHandler();

const generatingDialogueRoutes: FastifyPluginAsync = async (
  fastify,
  option
) => {
  fastify.get("/", {}, generatingDialogueHandler.get);
};

export default generatingDialogueRoutes;
