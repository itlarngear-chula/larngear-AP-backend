import { TDepartment } from '@/interfaces/department';
import { FlexBubble } from '@line/bot-sdk';

const slotBubble = ({
    slot,
    department,
    start,
    end,
    event,
    location,
    note,
    contactName,
    contactTel,
    slotColor,
}: {
    slot: number;
    department: TDepartment;
    start: string;
    end: string;
    event: string;
    location: string;
    note: string;
    contactName: string;
    contactTel: string;
    slotColor: string;
}): FlexBubble => {
    return {
        type: 'bubble',
        size: 'mega',
        body: {
            type: 'box',
            layout: 'vertical',
            contents: [
                {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'text',
                            text: `#${slot} | ${department}`,
                            weight: 'bold',
                            color: '#F8FAFC',
                            size: 'xs',
                        },
                        {
                            type: 'text',
                            text: `${start} - ${end}`,
                            weight: 'bold',
                            size: 'xxl',
                            margin: 'md',
                            color: '#F8FAFC',
                        },
                    ],
                    paddingAll: 'xxl',
                    backgroundColor: `${slotColor}`,
                },
                {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                                {
                                    type: 'text',
                                    text: 'กิจกรรม',
                                    size: 'xs',
                                    color: '#64748B',
                                },
                                {
                                    type: 'text',
                                    text: `${event ? event : '-'}`,
                                    size: 'xl',
                                    weight: 'bold',
                                    wrap: true,
                                    color: '#1E293B',
                                },
                            ],
                        },
                        {
                            type: 'separator',
                            margin: 'xl',
                            color: '#F8FAFC',
                        },
                        {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                                {
                                    type: 'text',
                                    text: 'สถานที่',
                                    size: 'xs',
                                    color: '#64748B',
                                },
                                {
                                    type: 'text',
                                    text: `${location ? location : '-'}`,
                                    size: 'lg',
                                    weight: 'bold',
                                    wrap: true,
                                    color: '#1E293B',
                                },
                            ],
                        },
                        {
                            type: 'separator',
                            margin: 'xl',
                            color: '#F8FAFC',
                        },
                        {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                                {
                                    type: 'text',
                                    text: 'หมายเหตุ',
                                    size: 'xs',
                                    color: '#64748B',
                                },
                                {
                                    type: 'text',
                                    text: `${note ? note : '-'}`,
                                    color: '#334155',
                                },
                            ],
                        },
                    ],
                    paddingAll: 'xxl',
                    paddingBottom: 'xs',
                    backgroundColor: '#F8FAFC',
                },
                {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                                {
                                    type: 'button',
                                    action: {
                                        type: 'uri',
                                        label: `โทรหา ${contactName}`,
                                        uri: `tel:${contactTel}`,
                                    },
                                    color: '#233145',
                                    height: 'sm',
                                },
                            ],
                            backgroundColor: '#E2E8F0',
                            cornerRadius: 'lg',
                        },
                    ],
                    paddingAll: 'xxl',
                    backgroundColor: '#F8FAFC',
                },
            ],
            paddingAll: 'none',
        },
        styles: {
            footer: {
                separator: true,
            },
        },
    };
};

const setOffsetBubble = ({
    slot,
    slotName,
    offset,
    displayName,
    totalOffset,
    beforeStart,
    beforeEnd,
    afterStart,
    afterEnd,
    reason,
}: {
    slot: number;
    slotName: string;   
    offset: number;
    displayName: string;
    totalOffset: number;
    beforeStart: string;
    beforeEnd: string;
    afterStart: string;
    afterEnd: string;
    reason: string;
}): FlexBubble => {
    const offsetLabel = `${offset > 0 ? `+${offset}` : offset} นาที`;

    return {
        type: 'bubble',
        size: 'kilo',
        body: {
            type: 'box',
            layout: 'vertical',
            contents: [
                {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'text',
                            text: 'ANNOUNCEMENT',
                            weight: 'bold',
                            color: '#e94444',
                            size: 'xs',
                        },
                        {
                            type: 'text',
                            text: offsetLabel,
                            weight: 'bold',
                            size: 'xxl',
                            margin: 'md',
                            color: '#F8FAFC',
                        },
                    ],
                    paddingAll: 'xxl',
                    backgroundColor: '#101E30',
                },
                {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                                {
                                    type: 'text',
                                    text: 'ตั้งแต่',
                                    size: 'xs',
                                    color: '#64748B',
                                },
                                {
                                    type: 'text',
                                    text: `Slot #${slot}`,
                                    size: 'xl',
                                    weight: 'bold',
                                    wrap: true,
                                    color: '#1E293B',
                                },

                                
                                {
                                    type: 'text',
                                    text: slotName ? `${slotName}` : '-',
                                    size: 'sm',
                                    weight: 'bold',
                                    wrap: true,
                                    color: '#475569',
                                    margin: 'sm',
                                },

                                
                                // {
                                //     type: 'text',
                                //     text: `จาก ${beforeStart}-${beforeEnd} เป็น ${afterStart}-${afterEnd}`,
                                //     size: 'md',
                                //     wrap: true,
                                //     color: '#334155',
                                //     margin: 'md',
                                // },

                                // (แยก 2 บรรทัด)
                                {
                                    type: 'text',
                                    text: `จาก ${beforeStart}-${beforeEnd}`,
                                    size: 'xs',
                                    wrap: true,
                                    color: '#334155',
                                    margin: 'md',
                                },
                                {
                                    type: 'text',
                                    text: `เป็น ${afterStart}-${afterEnd}`,
                                    size: 'xs',
                                    wrap: true,
                                    color: '#334155',
                                    margin: 'sm',
                                },

                                {
                                    type: 'text',
                                    text: `description: ${reason}`,
                                    size: 'sm',
                                    wrap: true,
                                    color: '#475569',
                                    margin: 'md',
                                },

                                {
                                    type: 'separator',
                                    margin: 'md',
                                },
                                {
                                    type: 'text',
                                    text:
                                        totalOffset === 0
                                            ? 'Set Zero'
                                            : `รวมบวก AP ทั้งหมด ${totalOffset} นาที`,
                                    size: 'lg',
                                    weight: 'bold',
                                    wrap: true,
                                    color: '#1E293B',
                                    margin: 'md',
                                },
                                {
                                    type: 'text',
                                    text: `โดย ${displayName}`,
                                    size: 'xs',
                                    wrap: true,
                                    color: '#64748B',
                                    margin: 'sm',
                                    align: 'end',
                                },
                            ],
                        },
                    ],
                    paddingAll: 'xxl',
                },
            ],
            paddingAll: 'none',
        },
        styles: {
            footer: {
                separator: true,
            },
        },
    };
};



export default {
    slotBubble,
    setOffsetBubble,
};
