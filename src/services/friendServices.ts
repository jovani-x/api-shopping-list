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

export const deleteUser = async (userId: string, ownerId: string) => {
  const user = await User.findOneAndUpdate(
    { _id: ownerId, "users.userId": userId },
    {
      $pull: {
        users: {
          userId,
        },
      },
    }
  ).select(["userName"]);
  if (user) {
    await User.findOneAndUpdate(
      { _id: userId, "users.userId": ownerId },
      {
        $pull: {
          users: {
            userId: ownerId,
          },
        },
      }
    ).select(["userName"]);
  }

  return user;
};

export const sendFriendRequest = async (email: string, fromUserId: string) =>
  await User.updateOne(
    { email },
    {
      $push: {
        requests: {
          name: UserRequest.becomeFriend,
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
    const updatedUser = await User.updateOne(
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

export const sendInvitation = async (newUserEmail: string, owner: string) => {
  // send email with nodemailer or email service API
  // to 'newUserEmail'
  // 'owner' invites you to join to our service
  console.log(`Invitation has been sent to ${newUserEmail} from ${owner}`);
};
