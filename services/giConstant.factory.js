(function () {
    'use strict';

    angular
        .module('app')
        .factory('giConstant', GIConstant);

    GIConstant.$inject = [];

    function GIConstant() {

        return {
            NEW_RECORD: "NEW",
            ELIG_NEW_RECORD: "ELIG_NEW",
            GUID_EMPTY: '00000000-0000-0000-0000-000000000000',
            EMPLOYEE_SELF: '77777777-7777-7777-7777-777777777777',

            LookupValidationExpressions: {
                Custom: 99,
                CustomText: 'Custom'
            },

            AcceptedFileTpes:{
                EXCEL: '.xls,.xlsx'
            },
            EmployeeSearchGrid:{
                EMPLOYEE: 'Employee'
            },
            LookupEntities: {
                EMPLOYEE: 'Employee',
                POLICY: 'Policy',
                BROKEREDPOLICY: 'BrokeredPolicy',
                EMPLOYEEBENEFIT: 'EmployeeBenefit'
            },

            EditMode: {
                LOADING: -2,
                LOADED: -1,
                READ: 0,
                EDIT: 1,
                PRISTINE: 10,
                DIRTY: 11,
                SAVE: 99
            },

            EditPanelMode: {
                READ_ONLY: 0,
                EDITABLE: 1,
                OPEN_IN_EDIT: 2,
                STICKY_EDIT: 3
            },

            Filter: {
                EXCLUDE_FULL: 1,
                EXCLUDE_PARTIAL: 2,
                EXCLUDE_ENTITY: "*"
            },

            LookupRelationshipType: {
                Self: 0,
                Spouse: 1,
                DomesticPartner: 2,
                Child: 3,
                Other: 4,
                Unborn: 5,
                Parents: 6,
                ParentsInLaw: 7
            },

            LookupEmployeeRelationshipType: {
                Employee: 0,
                Dependant: 1,
                Beneficiary: 2,
                Trust: 3,
                Estate: 4,
                Organization: 5
            },

            Import: {
                NoneTransformationType: "0",
                CustomTransformationType: "3",
                DefaultTransformationType: "4"
            },

            Participant: {
                FIRSTLASTLAST2ANDTYPE: 1
            },

            LookupEOIBarType: {
                NONE: 0,
                PERCENTAGE: 1,
                AMOUNT: 2,
                COVERAGE: 3,
                CROSS_LINE: 4,
                CURRENT_AMOUNT: 5,
                INCREASE_BY_STEP: 6,
                INCREASE_BY_AMOUNT: 7
            },

            LookupEOIStatus: {
                PENDING : 1,
                CANCELLED : 2,
                APPROVED : 3,
                DECLINED : 4,
                VALIDATING : 5,
                DROPPED : 6,
                APPROVING : 7,
                DEFERRED : 8,
                CANCELLING : 9,
                DECLINING: 10,
                DEPTRACKINGONLY : 11
            },

            LookupEventStatus: {
                PENDING: 1,
                SUBMITTED: 2,
                APPROVED: 3,
                DECLINED: 4,
                QUEUED: 5,
                EXPIRED : 6, //UI only status
                DECLINED_FROM_PENDING: 41,
                DECLINED_FROM_SUBMITTED: 42,
                DECLINED_FROM_APPROVED: 43,
            },

            LookupEventType: {
                PURCHASE_TYPE: 21
            },

            LookupInterimCoverageType: {
                NO_COVERAGE: 1,
                ASSIGNED_COVERAGE: 2,
                CURRENT_COVERAGE: 3,
                FUNDED_COVERAGE: 4,
                EOI_BAR_COVERAGE: 5,
                BEST_TIERED_COVERAGE: 6
            },

            Privilege: {
                READ: 1,
                UPDATE: 2,
                ADD: 3,
                CREATE: 3,
                DELETE: 4
            },

            EntityChange: {
                CLOSE: -1,
                SAVE: 1,
                DELETE: 2,
                EXPIRE: 3,
                REFRESH: 4
            },

            LookupExportParameter: {
                EligibilityRule : 1,
                Client: 2,
                Environment: 3,
                PayrollPeriodStart: 4,
                PayrollPeriodEnd: 5,
                DateFrom: 6,
                DateTo: 7,
                DateRuleFrom: 8,
                DateRuleTo: 9,
                Line: 10
            },

            EntityName: {
                PENDINGBROKEREDPOLICY: "PendingBrokeredPolicy",
                QUALIFYINGQUESTIONS: "Qualifying Questions",
                EOIQUESTIONS: "EOIQuestions",
                LINE: "Line",
                BENEFITPLANEOIRULEQUESTIONSET: "BenefitPlanEOIRuleQuestionSet"
            },

            LookupLineType: {
                TIERED: 1,
                VOLUME: 2,
                UNIT: 4,
                QUESTION: 5,
                CURRENCY: 6,
                HOLIDAYBUYSELL: 7,
                PENSION: 8,
                VOUCHER: 9,
                FUNDALLOCATION: 10,
                BUILDYOUROWNLINE: 11,
                FRANCEINDIVIDUALPREMIUMLINE :12
            },

            LookupFrequency: {
                DAILY: 0,
                WEEKLY: 1,
                MONTHLY: 4,
                ANNUAL: 7,
                NOT_SPECIFIED: 9,
                QUARTERLY: 5,
                SEMI_ANNUAL: 6,
                BI_WEEKLY: 2,
                SEMI_MONTHLY: 3
            },
            BenefitAction: {
                TERM: 1,
                QUALIFYING_QUESTIONS: 2,
                COVERAGE: 3,
                ADDON: 3.1,
                EOI: 4,
                EOI_RESULTS: 5,
                FOLLOWUP: 6,
                ELECTION_RESULTS: 7
            },
            ProcessingStatus: {
                COMPLETE: 'Complete'
            },
            LookupFlexBenefitsModel: {
                ENROLMENT: 0,
                PURCHASE: 1
            },

            TagSummary: {
                BU: 'BU',
                GU: 'GU',
                TAG: 'TAG'
            },

            PaymentTransactionPeriods: {
                LAST30DAYS: 30,
                LASTYEARTODATE: 365,
                ALLTIME: 0
            },

            PaymentTransactionStatus: {
                FAILED: {
                    name: 'Fail',
                    color: '#FF0000'
                },
                PENDING: {
                    name: 'Pending',
                    color: '#FFA500'
                },
                SUCCESS: {
                    name: 'Success',
                    color: '#008000'
                },
            },
            PolicyRenewalState: {
                Pending: 0,
                InProgress: 1,
                Post: 2
            },
            EmployeeCoverageLevel: {
                Policy: 1,
                Line: 2,
                Employee: 3,
                Dependant: 4
            },
            PrestIj: {
                BpijStatus: {
                    Unknown: 1,
                    Excluded: 2,
                    CountGenerated: 3
                }
            },
            InstanceStatus: {
                Complete: 'Promote-Complete'
            },
            XpressProcessingStatus: {
                PENDING: "Pending",
                PROCESSED: "Processed"
            },
            EntityType: {
                POLICYUPDATE: "Policy Update",
                NEWPOLICY: "New Policy"
            },
            LookupLineDiscountAmountType: {
                PERCENT: 0,
                FIXEDAMOUNT: 1
            },
            LookupBeneficieryType: {
                PhysicalASS: "ASS",
                PhysicalBEN: "BEN",
                PhysicalTUT: "TUT",
                LegalENT: "ENT",
                LegalRUR: "RUR",
            },
            LookupAmountType: {
                NOTSPECIFIED: 0,
                PERCENTOFSALARY: 1,
                CURRENCY: 2,
                VOUCHERAMOUNT: 3,
                DAYS: 4,
                HOURS: 5,
                VOUCHERS: 7,
                CUSTOMTYPE: 8
            }
        };
    }

})();