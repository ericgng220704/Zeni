import { User, MessageContent } from "@/type";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { lightenColor } from "@/lib/utils";
import { TextShimmerWave } from "../motion-primitives/text-shimmer-wave";
import Image from "next/image";
import { InteractiveCardMessage } from "./InteractiveCardMessage";
import { InteractiveFormMessage } from "./InteractiveFormMessage";

export default function ChatMessage({
  type,
  message,
  user,
  selectedModel,
  isLoading,
  currentStep,
}: {
  type: "left" | "right";
  message: MessageContent | "";
  user: User;
  selectedModel?: string;
  isLoading?: boolean;
  currentStep?: string;
}) {
  if (type === "left") {
    return (
      <div
        className="flex gap-4 mb-12 md:pr-12 md:pl-4"
        style={{
          whiteSpace: "pre-wrap",
          lineHeight: "1.6",
        }}
      >
        <div className="rounded-full overflow-hidden w-[28px] h-[28px] min-w-[28px] min-h-[28px]">
          <Image src={"/chatbot.jpg"} alt="chatbot" width={80} height={80} />
        </div>

        {isLoading && selectedModel === "question" && (
          <div className="typing-indicator flex gap-1 mt-5">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )}

        {isLoading && currentStep && selectedModel === "command" && (
          <TextShimmerWave className="font-mono text-sm" duration={1}>
            {currentStep}
          </TextShimmerWave>
        )}

        {message && message.type === "interactive" ? (
          message.component === "Card" ? (
            <InteractiveCardMessage
              message={message.message}
              data={message.props}
              subtype={message.subtype}
            />
          ) : (
            <InteractiveFormMessage
              message={message.message}
              props={message.props}
              callback={message.callback}
            />
          )
        ) : (
          <p className="text-sm xs:text-base bg-gray-100 px-3 xs:px-4 py-[0.45rem] rounded-xl">
            {message && message.content}
          </p>
        )}
      </div>
    );
  } else {
    return (
      <div className="text-right mb-12 flex gap-4 justify-end md:pl-20 md:pr-4">
        {message && message.type === "interactive" ? (
          message.component === "Card" ? (
            <InteractiveCardMessage
              message={message.message}
              data={message.props}
              subtype={message.subtype}
            />
          ) : (
            <InteractiveFormMessage
              message={message.message}
              props={message.props}
              callback={message.callback}
            />
          )
        ) : (
          <p
            className="px-3 xs:px-4 py-[0.45rem] rounded-xl text-sm xs:text-base"
            style={{
              backgroundColor: lightenColor(user.color),
            }}
          >
            {message && message.content}
          </p>
        )}
        <div>
          <Avatar className="h-6 w-6">
            <AvatarImage src={user.image} />
            <AvatarFallback>{user.name}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    );
  }
}
