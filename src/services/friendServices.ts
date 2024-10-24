import { User } from "@/models/User.js";
import { UserRequest } from "@/data/types.js";

export const getAllUsers = async ({
  userIds,
  selectFields = ["userName", "cards"],
}: {
  userIds: string[];
  selectFields?: string[];
}) => await User.find({ _id: { $in: userIds } }).select(selectFields);

export const getUserById = async ({
  id,
  selectFields = ["userName"],
}: {
  id: string;
  selectFields?: string[];
}) => await User.findById(id).select(selectFields);

export const getUserByEmail = async ({
  email,
  selectFields = ["userName"],
}: {
  email: string;
  selectFields?: string[];
}) => await User.findOne({ email: email }).select(selectFields);

export const deleteUser = async (userId: string, ownerId: string) => {
  await User.findOneAndUpdate(
    { _id: ownerId, "users.userId": userId },
    {
      $pull: {
        users: {
          userId,
        },
      },
    }
  ).select(["userName"]);

  const friend = await User.findOneAndUpdate(
    { _id: userId, "users.userId": ownerId },
    {
      $pull: {
        users: {
          userId: ownerId,
        },
      },
    }
  )
    .select(["userName"])
    ?.lean();

  return friend;
};

export const deleteUsers = async (userIds: string[], ownerId: string) => {
  // Remove multiple users from the owner's "users" array
  await User.findOneAndUpdate(
    { _id: ownerId },
    {
      $pull: {
        users: {
          userId: { $in: userIds },
        },
      },
    }
  ).select(["userName"]);

  // For each user in the userIds array, remove the owner from their "users" array
  const friends = await User.updateMany(
    { _id: { $in: userIds }, "users.userId": ownerId },
    {
      $pull: {
        users: {
          userId: ownerId,
        },
      },
    }
  )
    .select(["userName"])
    ?.lean();

  return friends;
};

export const sendFriendRequest = async ({
  email,
  fromUserId,
  text,
}: {
  email: string;
  fromUserId: string;
  text: string;
}) =>
  await User.updateOne(
    { email },
    {
      $push: {
        requests: {
          name: UserRequest.becomeFriend,
          text: text,
          from: fromUserId,
        },
      },
    }
  );

export const approveFriendRequest = async (
  fromUserId: string,
  ownerId: string
) => {
  const updatedOwner = await User.findOneAndUpdate(
    { _id: ownerId, "requests.from": fromUserId },
    {
      $pull: {
        requests: {
          name: UserRequest.becomeFriend,
          from: fromUserId,
        },
      },
      $push: {
        users: {
          userId: fromUserId,
          userName: await getUserById({ id: fromUserId }).then(
            (user) => user?.userName
          ),
        },
      },
    },
    {
      new: true,
    }
  );
  if (updatedOwner) {
    await User.updateOne(
      { _id: fromUserId },
      {
        $push: {
          users: {
            userId: ownerId,
            userName: await getUserById({ id: ownerId }).then(
              (user) => user?.userName
            ),
          },
        },
      },
      {
        new: true,
      }
    );
  }
  return updatedOwner;
};

export const declineFriendRequest = async (
  fromUserId: string,
  ownerId: string
) =>
  await User.findOneAndUpdate(
    { _id: ownerId, "requests.from": fromUserId },
    {
      $pull: {
        requests: {
          name: UserRequest.becomeFriend,
          from: fromUserId,
        },
      },
    },
    {
      new: true,
    }
  );

export const sendInvitation = async ({
  email,
  fromUserId,
  text,
}: {
  email: string;
  fromUserId: string;
  text: string;
}) => {
  // send email with nodemailer or email service API
  // to 'newUserEmail'
  // 'owner' invites you to join to our service
  console.log(
    `Invitation has been sent to ${email} from ${fromUserId} with message: ${text}`
  );
};

export const getUserRequests = async (ownerId: string, type?: UserRequest) => {
  const user = (
    await User.findById(ownerId)
      .select(["requests"])
      .populate([
        {
          path: "requests.from",
          select: "userName",
          strictPopulate: false,
        },
      ])
  )?.toObject();

  const allRequests = user?.requests;

  return !type
    ? allRequests
    : allRequests?.filter((r) => r.name === UserRequest.becomeFriend);
};

export const getUserFriends = async ({ ownerId }: { ownerId: string }) => {
  const owner = await getUserById({ id: ownerId, selectFields: ["users"] });
  const userIds = owner?.users.map((el) => el.userId.toString()) || [];
  const resObj = await getAllUsers({ userIds });
  return resObj;
};
