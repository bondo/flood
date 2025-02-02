import classnames from 'classnames';
import {defineMessages, injectIntl} from 'react-intl';
import formatUtil from 'universally-shared-code/util/formatUtil';
import moment from 'moment';
import React from 'react';

import ClientStatusStore from '../../stores/ClientStatusStore';
import connectStores from '../../util/connectStores';
import Download from '../icons/Download';
import Duration from '../general/Duration';
import EventTypes from '../../constants/EventTypes';
import InfinityIcon from '../icons/InfinityIcon';
import Size from '../general/Size';
import TransferDataStore from '../../stores/TransferDataStore';
import Upload from '../icons/Upload';

const messages = defineMessages({
  ago: {
    id: 'general.ago',
    defaultMessage: 'ago',
  },
});

const icons = {
  download: <Download />,
  infinity: <InfinityIcon />,
  upload: <Upload />,
};

class TransferRateDetails extends React.Component {
  getCurrentTansferRate(slug, options = {}) {
    const {inspectorPoint, isClientConnected, transferSummary} = this.props;

    const throttles = {
      download: transferSummary.downThrottle,
      upload: transferSummary.upThrottle,
    };
    let timestamp = null;
    const transferTotals = {
      download: transferSummary.downTotal,
      upload: transferSummary.upTotal,
    };

    let transferRates = {
      download: transferSummary.downRate,
      upload: transferSummary.upRate,
    };

    if (inspectorPoint != null) {
      transferRates = {
        upload: inspectorPoint.uploadSpeed,
        download: inspectorPoint.downloadSpeed,
      };
    }

    const secondaryDataClasses = classnames('client-stats__rate__data--secondary', {
      'is-visible': inspectorPoint == null && isClientConnected,
    });

    const timestampClasses = classnames('client-stats__rate__data--timestamp', {
      'is-visible': inspectorPoint != null && options.showHoverDuration,
    });

    if (inspectorPoint != null && inspectorPoint.nearestTimestamp != null) {
      const currentTime = moment(Date.now());
      const durationSummary = formatUtil.secondsToDuration(
        moment.duration(currentTime.diff(moment(inspectorPoint.nearestTimestamp))).asSeconds(),
      );

      timestamp = (
        <div className={timestampClasses}>
          <Duration suffix={this.props.intl.formatMessage(messages.ago)} value={durationSummary} />
        </div>
      );
    }

    let limit = null;

    if (throttles[slug] === 0) {
      limit = icons.infinity;
    } else {
      limit = <Size value={throttles[slug]} isSpeed />;
    }

    return (
      <div className={`client-stats__rate client-stats__rate--${slug}`}>
        <div className="client-stats__rate__icon">{icons[slug]}</div>
        <div className="client-stats__rate__data">
          <div className="client-stats__rate__data--primary">
            <Size value={transferRates[slug]} isSpeed />
          </div>
          {timestamp}
          <div className={secondaryDataClasses}>
            <div className="client-stats__rate__data--total">
              <Size value={transferTotals[slug]} />
            </div>
            <div className="client-stats__rate__data--limit">{limit}</div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="client-stats__rates">
        {this.getCurrentTansferRate('download', {showHoverDuration: true})}
        {this.getCurrentTansferRate('upload')}
      </div>
    );
  }
}

const ConnectedTransferRateDetails = connectStores(injectIntl(TransferRateDetails), () => {
  return [
    {
      store: ClientStatusStore,
      event: EventTypes.CLIENT_CONNECTION_STATUS_CHANGE,
      getValue: ({store}) => {
        return {
          isClientConnected: store.getIsConnected(),
        };
      },
    },
    {
      store: TransferDataStore,
      event: EventTypes.CLIENT_TRANSFER_SUMMARY_CHANGE,
      getValue: ({store}) => {
        return {
          transferSummary: store.getTransferSummary(),
        };
      },
    },
  ];
});

export default ConnectedTransferRateDetails;
