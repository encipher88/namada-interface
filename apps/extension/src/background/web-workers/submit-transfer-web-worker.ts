import { defaultChainId, chains } from "@anoma/chains";
import { Sdk } from "@anoma/shared";
import { init as initShared } from "@anoma/shared/src/init";
import { IndexedDBKVStore } from "@anoma/storage";
import { fromBase64 } from "@cosmjs/encoding";
import { KVPrefix } from "router";
import {
  INIT_MSG,
  SubmitTransferMessageData,
  TRANSFER_FAILED_MSG,
  TRANSFER_SUCCESSFUL_MSG,
} from "./types";

(async function init() {
  await initShared();
  const sdkStore = new IndexedDBKVStore(KVPrefix.SDK);
  //TODO: import sdk-store key - can't import from the keyring
  const sdkDataStr: string | undefined = await sdkStore.get("sdk-store");
  const sdk = new Sdk(chains[defaultChainId].rpc);
  await sdk.load_masp_params();

  if (sdkDataStr) {
    const sdkData = new TextEncoder().encode(sdkDataStr);
    sdk.decode(sdkData);
  }

  addEventListener(
    "message",
    ({ data }: { data: SubmitTransferMessageData }) => {
      sdk
        .submit_transfer(fromBase64(data.txMsg), data.password, data.xsk)
        .then(() => postMessage(TRANSFER_SUCCESSFUL_MSG))
        .catch(() => postMessage(TRANSFER_FAILED_MSG));
    },
    false
  );

  postMessage(INIT_MSG);
})();