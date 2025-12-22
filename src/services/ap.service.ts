import moment from 'moment';
import { ISlot } from '@/interfaces/ap';
import ApModel from '@/models/ap.model';
import { TDepartment } from '@/interfaces/department';
import axios from 'axios';
import messageTemplate from '@/templates/message.template';
import flexTemplate from '@/templates/flex.template';
import messageUtil from '@/utils/message.util';
import userService from './user.service';
import { DepartmentColors } from '@/interfaces/department';
import { FlexBubble } from '@line/bot-sdk';
import { IUser } from '@/interfaces/user';

const create = async (body: ISlot) => {
    const createdSlot = await ApModel.create(body)
        .then((slot) => slot)
        .catch((e) => {
            console.log(e);
            return null;
        });

    return createdSlot as ISlot;
};

const findAll = async () => {
    const slots = await ApModel.find()
        .then((slot) => slot)
        .catch(() => null);

    if (!slots) {
        return null;
    }

    return slots
        .filter((slot) => slot.slot)
        .sort((a, b) => a.slot - b.slot) as ISlot[];
};

const findOneBySlot = async (slot: number) => {
    const slotData = await ApModel.findOne({
        slot,
    })
        .then((slot) => slot)
        .catch(() => null);

    return slotData as ISlot;
};

const findAnnouncedSlots = async () => {
    const slots = await ApModel.find({
        announced: true,
    })
        .then((slot) => slot)
        .catch(() => null);

    if (!slots) {
        return null;
    }

    return slots
        .filter((slot) => slot.slot)
        .sort((a, b) => a.slot - b.slot) as ISlot[];
};

const findUpcomingSlots = async () => {
    const slots = await ApModel.find({
        announced: false,
    })
        .then((slot) => slot)
        .catch(() => null);

    if (!slots) {
        return null;
    }

    return slots
        .filter((slot) => slot.slot)
        .sort((a, b) => a.slot - b.slot) as ISlot[];
};

const updateBySlot = async (
    slot: number,
    body: {
        slot?: number;
        start?: string;
        end?: string;
        duration?: string;
        department?: TDepartment;
        event?: string;
        location?: string;
        contact?: string;
        note?: string;
        announced?: boolean;
        notifiedOffsets?: number[];
        totalOffset?: number;
    }
) => {
    console.log(slot,body)
    const updatedSlot = await ApModel.findOneAndUpdate(
        {
            slot,
        },
        body,
        {
            new: true,
        }
    )
        .then((slot) => slot)
        .catch(() => null);

    return updatedSlot as ISlot;
};

const getSheet = async (sheet: string) => {
    const slots: ISlot[] | null = await axios
        .get(process.env.AP_SHEET_API!, {
            params: {
                action: 'getSlots',
                sheet,
            },
        })
        .then((res) => {
            if (res.data.success) return res.data.data;

            return null;
        })
        .catch((err) => console.log(err));

    return slots;
};

const syncSheet = async (sheet: string) => {
    const slots = (await getSheet(sheet))?.filter((slot) => slot.slot);

    if (!slots) {
        return null;
    }

    const syncedSheet = slots.map(async (slot) => {
        const existedSlot = await findOneBySlot(slot.slot);

        const start = moment(moment(slot.start).format('HH:mm:ss'), 'HH:mm:ss')
            .utc()
            .format();
        const end = moment(moment(slot.end).format('HH:mm:ss'), 'HH:mm:ss')
            .utc()
            .format();

        slot.start = start;
        slot.end = end;

        if (!existedSlot) {
            const createdSlot = await create({ ...slot, announced: false, totalOffset: 0 });
            return createdSlot;
        }

        const updatedSlot = await updateBySlot(slot.slot, slot);

        return updatedSlot;
    });

    if (syncedSheet.length === 0) {
        return null;
    }

    return syncedSheet;
};

const findActiveSlots = async () => {
    const slots = (await findAll()) as ISlot[];

    if (!slots) {
        return null;
    }

    const activeSlots = slots.filter((slot) => {
        const currentTime = moment().utcOffset(7);
        const startTime = moment(
            moment(slot.start).format('HH:mm:ss'),
            'HH:mm:ss'
        ).utcOffset(7);
        const endTime = moment(
            moment(slot.end).format('HH:mm:ss'),
            'HH:mm:ss'
        ).utcOffset(7);
        if (endTime.isBefore(startTime)) endTime.add(1, 'day');
        const isBetween = currentTime.isBetween(startTime, endTime);
        const isSameAsStart =
            currentTime.format('HH:mm') === startTime.format('HH:mm');

        if (isBetween || isSameAsStart) return slot;
    });

    return activeSlots.sort((a, b) => a.slot - b.slot);
};

const findSlotsByOffset = async (offset: 0 | 5 | 10) => {
    const slots = await ApModel.find({
        announced: false,
    })
        .then((slot) => slot)
        .catch(() => null);
    
    if (!slots) return [];

    const now = moment().utcOffset(7).seconds(0).milliseconds(0);

    return slots.filter((slot) => {
        if (!slot.start) return false;

        const startTime = moment(
            moment(slot.start).format('HH:mm:ss'),
            'HH:mm:ss'
        )
            .utcOffset(7)
            .seconds(0)
            .milliseconds(0);

        if (startTime.isBefore(now)) {
            startTime.add(1, 'day');
        }

        const diff = startTime.diff(now, 'minutes');

        const alreadyNotified =
            slot.notifiedOffsets?.includes(offset);

        return (diff >= offset && diff < offset + 1) && !alreadyNotified;
    });
};

const multicastAnnounceSlots = async (multicastingSlots: ISlot[], users: IUser[], offset: 0 | 5 | 10) => {
    // const multicastingSl/ots = await announceSlots();
    // const users = await userService.findAll();

    if (!multicastingSlots) {
        return null;
    }

    if (!users) {
        return null;
    }

    const userContents = {} as {
        [key: string]: { slot: number; slotColor: string }[];
    };

    for (const user of users) {
        for (const slot of multicastingSlots) {
            if (
                user.selectedDepartments.includes(slot.department) &&
                user.enableBot
            ) {
                if (!userContents[user.userId as keyof typeof userContents]) {
                    Object.defineProperty(userContents, user.userId, {
                        value: [],
                        writable: true,
                        enumerable: true,
                        configurable: true,
                    });
                }

                userContents[user.userId as keyof typeof userContents].push({
                    slot: slot.slot,
                    slotColor: DepartmentColors[user.selectedColors?.[slot.department] || 'default' as keyof typeof DepartmentColors],
                });
            }
        }
    }

    // const sampleUserContents = {
    //     user1: [
    //         { slot: 1, slotColor: 'red' },
    //         { slot: 2, slotColor: 'blue' },
    //     ],
    //     user2: [
    //         { slot: 1, slotColor: 'green' },
    //         { slot: 3, slotColor: 'yellow' },
    //     ],
    //     user3: [
    //         { slot: 2, slotColor: 'purple' },
    //         { slot: 3, slotColor: 'orange' },
    //     ],
    //     user4: [
    //         { slot: 2, slotColor: 'purple' },
    //         { slot: 3, slotColor: 'orange' },
    //     ],
    // };


    const groupedUserContents = messageUtil.groupMessage(userContents);

    for (const key of Object.keys(groupedUserContents)) {
        const slotIndexes = JSON.parse(key) as { slot: number; slotColor: string }[];
        const userIds = groupedUserContents[key];

        interface ISlotwColor extends ISlot {
            slotColor?: string;
        }
        const slots = [] as ISlotwColor[];

        slotIndexes.forEach((slotIndex) => {
            const slot = multicastingSlots.find(
                (slot) => slot.slot === slotIndex.slot
            );

            if (slot) slots.push(slot);
            slots[slots.length -1].slotColor = slotIndex.slotColor;
        });

        const contents = slots
            .map((slot) => {
                if (!slot) {
                    return null;
                }

                const start = moment(slot.start).utcOffset(7).format('HH:mm');
                const end = moment(slot.end).utcOffset(7).format('HH:mm');

                const contactRegex = /(.+?) \((\d{3}-\d{3}-\d{4})\)/;

                const contactMatches = slot.contact.match(contactRegex);

                const content = flexTemplate.slotBubble({
                    slot: slot.slot,
                    department: slot.department,
                    start: start,
                    end: end,
                    event: slot.event,
                    location: slot.location,
                    note: slot.note,
                    contactName: contactMatches ? contactMatches[1] : '-',
                    contactTel: contactMatches ? contactMatches[2] : '-',
                    slotColor: slot.slotColor?? '#8B5CF6',
                });

                return content;
            })
            .filter((content) => content !== null) as FlexBubble[];

        const message = messageTemplate.flex({
            altText: slots
                .map((slot, index) => {
                    const start = moment(slot.start)
                        .utcOffset(7)
                        .format('HH:mm');
                    const end = moment(slot.end).utcOffset(7).format('HH:mm');
                    return `${offset === 0 ? '' : `[แจ้งเตือนล่วงหน้า ${offset} นาที] `}${slot.event} ${start}-${end} ${
                        index === slots.length - 1 ? '' : '|'
                    }`;
                })
                .join(' '),
            contents: {
                type: 'carousel',
                contents: contents,
            },
        });

        const replyData = {
            to: userIds,
            messages: [message],
        };

        console.log('user: ', userIds, 'text: ', message.altText, '\n');

        await messageUtil.sendMessage('multicast', replyData);
    }
    return multicastingSlots;
};

const notifySlots = async () => {
    const users = await userService.findAll();
    if (!users) return;

    // Pre-filter enabled users
    const enabledUsers = users.filter(
        (u) => u.enableBot && (u.notificationTime === 0 || u.notificationTime === 5 || u.notificationTime === 10)
    );

    // Group users by department & notificationTime
    const usersByDeptAndTime = new Map<
        TDepartment,
        { [key in 0 | 5 | 10]: string[] }
    >();

    for (const user of enabledUsers) {
        for (const dept of user.selectedDepartments) {
            const tdept = dept as TDepartment;

            if (!usersByDeptAndTime.has(tdept)) {
                usersByDeptAndTime.set(tdept, { 0: [], 5: [], 10: [] });
            }
            usersByDeptAndTime.get(tdept)![user.notificationTime].push(
                user.userId
            );
        }
    }

    let notifyingSlots = [] as ISlot[];
    
    // Process each offset
    for (const offset of [10, 5, 0] as const) {
        let notifyingSlotsForOffset = [] as ISlot[];
        const slots = await findSlotsByOffset(offset);
        if (slots.length === 0) continue;
        
        slots.sort((a, b) => a.slot - b.slot);

        for (const slot of slots) {
            const deptMap = usersByDeptAndTime.get(slot.department);

            if (!deptMap) continue;

            // Rule:
            // offset 10 → users with notificationTime=10
            // offset 5  → users with notificationTime=5
            // offset 0  → users with notificationTime=0
            const userIds = deptMap[offset];

            if (userIds.length === 0) continue;

            notifyingSlots.push(slot as ISlot);
            notifyingSlotsForOffset.push(slot as ISlot);

            console.log(`Notifying Slot ${slot.slot} to ${userIds.length} users for offset ${offset} minutes`);

            // Mark offset as notified (IMPORTANT)
            await updateBySlot(slot.slot, {
                notifiedOffsets: [
                    ...(slot.notifiedOffsets ?? []),
                    offset,
                ],
            });

            if (offset === 0) {
                // Also mark as announced
                await updateBySlot(slot.slot, {
                    announced: true,
                });
            }
        }

        console.log(`${notifyingSlotsForOffset.length} slots have been notified for offset ${offset} minutes`);

        const usersToNotify = enabledUsers.filter((u) =>
            u.notificationTime === offset
        );

        await multicastAnnounceSlots(notifyingSlotsForOffset, usersToNotify as IUser[], offset);
    }

    return notifyingSlots;
};

const updateOffsetInSheet = async (sheet: string, updateData: any) => {
    await axios
        .post(process.env.AP_SHEET_API!, updateData, {
            params: {
                action: 'updateSlots',
                sheet,
            },
        })
        .then(() => {})
        .catch(() => {});
};

const setOffset = async (
    sheet: string,
    slot: number,
    offset: number,
    userId: string,
    displayName: string
) => {
    // const [slots, profile] = await Promise.all([findAll(), getProfile(userId)]);
    const slots = await findAll();

    if (!slots) throw new Error('slots is null');
    // if (!profile) throw new Error('profile is null');

    const targetSlots = slots.slice(slot - 1);

    const updatedSlots = [] as ISlot[];

    for (const slot of targetSlots) {
        const start = moment(slot.start)
            .utcOffset(7)
            .add(offset, 'minutes')
            .format();
        const end = moment(slot.end)
            .utcOffset(7)
            .add(offset, 'minutes')
            .format();
        const totalOffset = (slot.totalOffset??0)+offset;

        console.log(
            `${slot.slot}, ${moment(slot.start).format('HH:mm')} -> ${moment(
                start
            ).format('HH:mm')}, ${moment(slot.end).format('HH:mm')} -> ${moment(
                end
            ).format('HH:mm')}`
        );

        const updatedSlot = (await updateBySlot(slot.slot, {
            start,
            end,
            totalOffset,
        })) as ISlot;

        updatedSlots.push(updatedSlot);
    }

    const totalOffset = updatedSlots[0]?.totalOffset || 0;
    const sheetUpdateData = {} as Record<string, any>;

    for (const slot of updatedSlots) {
        sheetUpdateData[`B${slot.slot + 2}`] = moment(slot.start).format(
            'HH:mm'
        );
        sheetUpdateData[`C${slot.slot + 2}`] = moment(slot.end).format('HH:mm');
    }

    const content = flexTemplate.setOffsetBubble({ slot, offset, displayName, totalOffset });

    const message = messageTemplate.flex({
        altText: `${
            offset === 0 ? 0 : offset > 0 ? `+${offset}` : offset
        } นาที ตั้งแต่ Slot ที่ ${slot} เป็นต้นไป - "${totalOffset === 0 ? 'Set Zero' : `รวม ${totalOffset} นาที`}" โดย ${displayName} `,
        contents: content,
    });

    await Promise.all([
        updateOffsetInSheet(sheet, sheetUpdateData),
        messageUtil.sendMessage('broadcast', { messages: [message] }),
    ]);

    return updatedSlots;
};

export default {
    create,
    findAll,
    findOneBySlot,
    findAnnouncedSlots,
    findUpcomingSlots,
    updateBySlot,
    getSheet,
    syncSheet,
    findActiveSlots,
    findSlotsByOffset,
    multicastAnnounceSlots,
    notifySlots,
    updateOffsetInSheet,
    setOffset
};
